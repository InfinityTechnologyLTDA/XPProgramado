import React, { useEffect, useState, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  PanResponder,
  Platform,
  Animated
  
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";
import { getDatabase, ref, onValue, set, get, update } from 'firebase/database';
import { getAuth } from "firebase/auth";
import { Audio } from 'expo-av';
import { auth, db } from "../services/firebase.js"; // Importe corretamente seu auth e db
import { initialXP, initialLevel } from '../screens/TeladoPainel.js';
import AsyncStorage from '@react-native-async-storage/async-storage';




// ASSETS PADRÃO (modo default)
const pipeImage = require("../../assets/Inimigo1.png");
const enemyCenterImage = require("../../assets/Enemy.png");
const enemyTopImage = require("../../assets/Enemy1.png");
const enemyBottomImage = require("../../assets/Enemy2.png");

// ASSETS ALTERNATIVOS (modo invertido – enemies no topo)
const altPipeImage = require("../../assets/InimigoTop.png");
const altEnemyCenterImage = require("../../assets/EnemyTop.png");
const altEnemyTopImage = require("../../assets/EnemyTop1.png");
const altEnemyBottomImage = require("../../assets/EnemyTop2.png");

// ASSETS PARA MODO LEFT (enemies na esquerda)
const leftPipeImage = require("../../assets/InimigoAlt.png");
const leftEnemyCenterImage = require("../../assets/EnemyAlt.png");
const leftEnemyTopImage = require("../../assets/EnemyAlt1.png");
const leftEnemyBottomImage = require("../../assets/EnemyAlt2.png");


const { width, height } = Dimensions.get("window");


// Componente Joystick – único e reutilizável
const Joystick = ({ size = 100, onMove }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { setOffset({ x: 0, y: 0 }); },
      onPanResponderMove: (evt, gestureState) => {
        let newX = gestureState.dx;
        let newY = gestureState.dy;
        const maxDistance = size / 2;
        const distance = Math.sqrt(newX * newX + newY * newY);
        if (distance > maxDistance) {
          const ratio = maxDistance / distance;
          newX *= ratio;
          newY *= ratio;
        }
        setOffset({ x: newX, y: newY });
        if (onMove) { onMove({ x: newX / maxDistance, y: newY / maxDistance }); }
      },
      onPanResponderRelease: () => {
        setOffset({ x: 0, y: 0 });
        if (onMove) { onMove({ x: 0, y: 0 }); }
      },
    })
  ).current;
  
  return (
    <View style={[joystickStyles.container, { width: size, height: size }]}>
      <View style={[joystickStyles.base, { width: size, height: size, borderRadius: size / 2 }]} />
      <View
        style={[
          joystickStyles.stick,
          { transform: [{ translateX: offset.x }, { translateY: offset.y }], borderRadius: size / 4 },
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const joystickStyles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center" },
  base: { backgroundColor: "#fff", opacity: 0.3 },
  stick: { position: "absolute", width: 50, height: 50, backgroundColor: "#fff", opacity: 0.8 },
});

// Array de personagens para seleção
const characters = [
  { id: 1, name: "Ghoul", normalImage: require("../../assets/Player1.png"), burstImage: require("../../assets/Player1Burst.png") },
  { id: 2, name: "Renegada", normalImage: require("../../assets/Player2.png"), burstImage: require("../../assets/Player2Burst.png") },
  { id: 3, name: "Caído", normalImage: require("../../assets/Player3.png"), burstImage: require("../../assets/Player3Burst.png") },
  { id: 4, name: "Demônio", normalImage: require("../../assets/Player4.png"), burstImage: require("../../assets/Player4Burst.png") },
  { id: 5, name: "Explorador", normalImage: require("../../assets/Player5.png"), burstImage: require("../../assets/Player5Burst.png") },
  { id: 6, name: "Fuzileiro", normalImage: require("../../assets/Player6.png"), burstImage: require("../../assets/Player6Burst.png") },
  { id: 7, name: "Virtual", normalImage: require("../../assets/Player7.png"), burstImage: require("../../assets/Player7Burst.png") },
  { id: 8, name: "Transcendido", normalImage: require("../../assets/Player8.png"), burstImage: require("../../assets/Player8Burst.png") },
];

// Asset de background
const bgImage = require("../../assets/Cenario1.png");

// Componente para renderizar o Player – imagem normal ou burst
const Player = (props) => {
  const x = props.body.position.x - 25;
  const y = props.body.position.y - 25;
  const angle = props.body.angle;
  const imageSource = props.isBurst 
    ? props.selectedCharacter.burstImage 
    : props.selectedCharacter.normalImage;
  return (
    <Image 
      source={imageSource}
      style={[styles.player, { left: x, top: y, transform: [{ rotate: angle + "rad" }] }]}
    />
  );
};

// Componente Ground
const Ground = (props) => {
  const x = props.body.position.x - props.width / 2;
  const y = props.body.position.y - 25;
  return <View style={[styles.ground, { left: x, top: y, width: props.width }]} />;
};

// Componente Obstacles – renderiza os pipes
const Obstacles = (props) => {
  return (
    <>
      {props.pipes.map((pipe, index) => {
        const pipeX = pipe.position.x - pipe.width / 2;
        const pipeY = pipe.position.y - pipe.height / 2;
        return (
          <Image
            key={index}
            source={
              pipe.leftMode 
                ? leftPipeImage 
                : (pipe.alt ? altPipeImage : pipeImage)
            }
            style={[styles.pipe, { left: pipeX, top: pipeY, width: pipe.width, height: pipe.height }]}
          />
        );
      })}
    </>
  );
};

// Renderizadores para o modo default (enemies na direita)
const RightEnemyCenterRenderer = (props) => (
  <Image 
    source={enemyCenterImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const RightEnemyTopRenderer = (props) => (
  <Image 
    source={enemyTopImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const RightEnemyBottomRenderer = (props) => (
  <Image 
    source={enemyBottomImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);

// Renderizadores para o modo invertido (enemies no topo)
const RightEnemyCenterAltRenderer = (props) => (
  <Image 
    source={altEnemyCenterImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const RightEnemyTopAltRenderer = (props) => (
  <Image 
    source={altEnemyTopImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const RightEnemyBottomAltRenderer = (props) => (
  <Image 
    source={altEnemyBottomImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);

// Renderizadores para o modo LEFT (enemies na esquerda) – novos assets
const LeftEnemyCenterRenderer = (props) => (
  <Image 
    source={leftEnemyCenterImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const LeftEnemyTopRenderer = (props) => (
  <Image 
    source={leftEnemyTopImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);
const LeftEnemyBottomRenderer = (props) => (
  <Image 
    source={leftEnemyBottomImage} 
    style={{
      position: "absolute", left: props.position.x, top: props.position.y,
      width: props.width, height: props.height, resizeMode: "contain",
      opacity: props.visible ? 1 : 0,
    }}
  />
);

// Função para gerar pipes no modo default (horizontal, vindo da direita)
const addPipePair = (world) => {
  const pipeSize = width * 0.15;
  // Calcula uma posição vertical aleatória para que o pipe fique completamente visível
  const randomY = Math.random() * (height - pipeSize) + pipeSize / 2;
  
  // Cria somente o pipe central
  let centralPipe = Matter.Bodies.rectangle(
    width + pipeSize / 2, randomY, pipeSize, pipeSize, { isStatic: true, label: "pipe" }
  );
  centralPipe.alt = false;
  
  Matter.World.add(world, [centralPipe]);
  centralPipe.width = pipeSize;
  centralPipe.height = pipeSize;
  
  return [centralPipe];
};


// Função para gerar pipe no modo invertido (vertical, vindo do topo) com um pipe central único
const addVerticalPipePair = (world) => {
  const pipeSize = height * 0.1;
  // Calcula uma posição horizontal aleatória para que o pipe fique centralizado
  const randomX = Math.random() * (width - pipeSize) + pipeSize / 2;
  
  let centralPipe = Matter.Bodies.rectangle(
    randomX, -pipeSize / 2, pipeSize, pipeSize, { isStatic: true, label: "pipe" }
  );
  centralPipe.alt = true;
  
  Matter.World.add(world, [centralPipe]);
  centralPipe.width = pipeSize;
  centralPipe.height = pipeSize;
  
  return [centralPipe];
};

// Função para gerar pipe no modo LEFT (vindo da esquerda) com apenas um pipe central
const addLeftPipePair = (world) => {
  const pipeSize = width * 0.15;
  // Calcula uma posição vertical aleatória para que o pipe fique centralizado
  const randomY = Math.random() * (height - pipeSize) + pipeSize / 2;
  
  let centralPipe = Matter.Bodies.rectangle(
    -pipeSize / 2, randomY, pipeSize, pipeSize, { isStatic: true, label: "pipe" }
  );
  centralPipe.leftMode = true;
  
  Matter.World.add(world, [centralPipe]);
  centralPipe.width = pipeSize;
  centralPipe.height = pipeSize;
  
  return [centralPipe];
};


// Sistema de física – movimenta os pipes conforme o modo
const PhysicsSystem = (entities, { time, isBurst, level }) => {
  let engine = entities.physics.engine;
  Matter.Engine.update(engine, time.delta);
  
  if (entities.player) { entities.player.isBurst = isBurst; }
  
  const baseMoveSpeed = 2;
  const moveSpeed = isBurst ? baseMoveSpeed * 2 : baseMoveSpeed;
  // Atualize para 4 modos: 0 = Left, 1 = Invert, 2 = Default, 3 = Todos juntos
  const mode = level % 4;
  
  if (mode === 0) {
    // Left Mode: pipes se movem da esquerda para a direita
    entities.obstacles.pipes.forEach(pipe => {
      Matter.Body.translate(pipe, { x: moveSpeed, y: 0 });
    });
    entities.obstacles.pipes = entities.obstacles.pipes.filter(pipe =>
      pipe.position.x - pipe.width < width
    );
  } else if (mode === 1) {
    // Invert Mode: pipes se movem de cima para baixo
    entities.obstacles.pipes.forEach(pipe => {
      Matter.Body.translate(pipe, { x: 0, y: moveSpeed });
    });
    entities.obstacles.pipes = entities.obstacles.pipes.filter(pipe =>
      pipe.position.y - pipe.height < height
    );
  } else if (mode === 2) {
    // Default Mode: pipes se movem da direita para a esquerda
    entities.obstacles.pipes.forEach(pipe => {
      Matter.Body.translate(pipe, { x: -moveSpeed, y: 0 });
    });
    entities.obstacles.pipes = entities.obstacles.pipes.filter(pipe =>
      pipe.position.x + pipe.width > 0
    );
  } else if (mode === 3) {
    // Modo 4: todos os 3 modos ao mesmo tempo – atualize cada pipe conforme sua origem
    entities.obstacles.pipes.forEach(pipe => {
      if (pipe.leftMode) {
        Matter.Body.translate(pipe, { x: moveSpeed, y: 0 });
      } else if (pipe.alt) {
        Matter.Body.translate(pipe, { x: 0, y: moveSpeed });
      } else {
        Matter.Body.translate(pipe, { x: -moveSpeed, y: 0 });
      }
    });
    entities.obstacles.pipes = entities.obstacles.pipes.filter(pipe => {
      if (pipe.leftMode) {
        return pipe.position.x - pipe.width < width;
      } else if (pipe.alt) {
        return pipe.position.y - pipe.height < height;
      } else {
        return pipe.position.x + pipe.width > 0;
      }
    });
  }
  
  
  return entities;
};

// Sistema para spawn de pipes e criação dos enemies conforme o modo
let pipeTimer = 0;
const PipeSpawner = (entities, { time, level }) => {
  pipeTimer += time.delta;
  // Atualize para 4 modos: 0 = Left, 1 = Invert, 2 = Default, 3 = Todos juntos
  const mode = level % 4;
  let newPipes;
  let enemyRenderers = {};
  let enemyPositions = {};
  
  if (pipeTimer >= 666) {
    pipeTimer = 0;
    
    if (mode === 0) {
      // Left Mode
      newPipes = addLeftPipePair(entities.physics.world);
      enemyRenderers = {
        left: LeftEnemyTopRenderer,
        center: LeftEnemyCenterRenderer,
        right: LeftEnemyBottomRenderer,
      };
      let enemySize = newPipes[0].width;
      let posX = 0;
      let posYTop = height * 0.25 - enemySize / 2;
      let posYCenter = height * 0.5 - enemySize / 2;
      let posYBottom = height * 0.75 - enemySize / 2;
      enemyPositions = {
        top: { x: posX, y: posYTop },
        center: { x: posX, y: posYCenter },
        bottom: { x: posX, y: posYBottom },
      };
      
      // Cria os inimigos para o modo Left
      const keyLeft = "enemyLeftLeft_" + Date.now();
      entities[keyLeft] = {
        position: enemyPositions.top,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.left,
      };
      const keyCenter = "enemyLeftCenter_" + Date.now();
      entities[keyCenter] = {
        position: enemyPositions.center,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.center,
      };
      const keyRight = "enemyLeftRight_" + Date.now();
      entities[keyRight] = {
        position: enemyPositions.bottom,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.right,
      };
      
    } else if (mode === 1) {
      // Invert Mode
      newPipes = addVerticalPipePair(entities.physics.world);
      enemyRenderers = {
        left: RightEnemyTopAltRenderer,
        center: RightEnemyCenterAltRenderer,
        right: RightEnemyBottomAltRenderer,
      };
      let enemySize = newPipes[0].width;
      enemyPositions = {
        left: { x: 10, y: 20 },
        center: { x: (width - enemySize) / 2, y: 20 },
        right: { x: width - enemySize - 10, y: 20 },
      };
      
      // Cria os inimigos para o modo Invert
      const keyLeft = "enemyTopLeft_" + Date.now();
      entities[keyLeft] = {
        position: enemyPositions.left,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.left,
      };
      const keyCenter = "enemyTopCenter_" + Date.now();
      entities[keyCenter] = {
        position: enemyPositions.center,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.center,
      };
      const keyRight = "enemyTopRight_" + Date.now();
      entities[keyRight] = {
        position: enemyPositions.right,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.right,
      };
      
    } else if (mode === 2) {
      // Default Mode
      newPipes = addPipePair(entities.physics.world);
      enemyRenderers = {
        left: RightEnemyTopRenderer,
        center: RightEnemyCenterRenderer,
        right: RightEnemyBottomRenderer,
      };
      let enemySize = newPipes[0].width;
      let posX = width - enemySize;
      let posYTop = height * 0.25 - enemySize / 2;
      let posYCenter = height * 0.5 - enemySize / 2;
      let posYBottom = height * 0.75 - enemySize / 2;
      enemyPositions = {
        top: { x: posX, y: posYTop },
        center: { x: posX, y: posYCenter },
        bottom: { x: posX, y: posYBottom },
      };
      
      // Cria os inimigos para o modo Default
      const keyLeft = "enemyRightLeft_" + Date.now();
      entities[keyLeft] = {
        position: enemyPositions.top,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.left,
      };
      const keyCenter = "enemyRightCenter_" + Date.now();
      entities[keyCenter] = {
        position: enemyPositions.center,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.center,
      };
      const keyRight = "enemyRightRight_" + Date.now();
      entities[keyRight] = {
        position: enemyPositions.bottom,
        width: enemySize,
        height: enemySize,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderers.right,
      };
      
    } else if (mode === 3) {
      // Modo 4: Todos os 3 modos ao mesmo tempo
      newPipes = [];
      // Gerar pipes de cada modo
      const leftPipes = addLeftPipePair(entities.physics.world);
      const verticalPipes = addVerticalPipePair(entities.physics.world);
      const defaultPipes = addPipePair(entities.physics.world);
      newPipes.push(...leftPipes, ...verticalPipes, ...defaultPipes);
      
      // Inimigos do modo Left
      let enemySizeLeft = leftPipes[0].width;
      let posXLeft = 0;
      let posYLeftTop = height * 0.25 - enemySizeLeft / 2;
      let posYLeftCenter = height * 0.5 - enemySizeLeft / 2;
      let posYLeftBottom = height * 0.75 - enemySizeLeft / 2;
      const enemyPositionsLeft = {
        top: { x: posXLeft, y: posYLeftTop },
        center: { x: posXLeft, y: posYLeftCenter },
        bottom: { x: posXLeft, y: posYLeftBottom },
      };
      const enemyRenderersLeft = {
        left: LeftEnemyTopRenderer,
        center: LeftEnemyCenterRenderer,
        right: LeftEnemyBottomRenderer,
      };
      
      // Inimigos do modo Invert
      let enemySizeVert = verticalPipes[0].width;
      const enemyPositionsVert = {
        left: { x: 10, y: 20 },
        center: { x: (width - enemySizeVert) / 2, y: 20 },
        right: { x: width - enemySizeVert - 10, y: 20 },
      };
      const enemyRenderersVert = {
        left: RightEnemyTopAltRenderer,
        center: RightEnemyCenterAltRenderer,
        right: RightEnemyBottomAltRenderer,
      };
      
      // Inimigos do modo Default
      let enemySizeDefault = defaultPipes[0].width;
      let posXDefault = width - enemySizeDefault;
      let posYDefaultTop = height * 0.25 - enemySizeDefault / 2;
      let posYDefaultCenter = height * 0.5 - enemySizeDefault / 2;
      let posYDefaultBottom = height * 0.75 - enemySizeDefault / 2;
      const enemyPositionsDefault = {
        top: { x: posXDefault, y: posYDefaultTop },
        center: { x: posXDefault, y: posYDefaultCenter },
        bottom: { x: posXDefault, y: posYDefaultBottom },
      };
      const enemyRenderersDefault = {
        left: RightEnemyTopRenderer,
        center: RightEnemyCenterRenderer,
        right: RightEnemyBottomRenderer,
      };
      
      // Cria os inimigos do modo Left
      const keyLeftLeft = "enemyLeftLeft_" + Date.now();
      entities[keyLeftLeft] = {
        position: enemyPositionsLeft.top,
        width: enemySizeLeft,
        height: enemySizeLeft,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersLeft.left,
      };
      const keyLeftCenter = "enemyLeftCenter_" + Date.now();
      entities[keyLeftCenter] = {
        position: enemyPositionsLeft.center,
        width: enemySizeLeft,
        height: enemySizeLeft,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersLeft.center,
      };
      const keyLeftRight = "enemyLeftRight_" + Date.now();
      entities[keyLeftRight] = {
        position: enemyPositionsLeft.bottom,
        width: enemySizeLeft,
        height: enemySizeLeft,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersLeft.right,
      };
      
      // Cria os inimigos do modo Invert
      const keyTopLeft = "enemyTopLeft_" + Date.now();
      entities[keyTopLeft] = {
        position: enemyPositionsVert.left,
        width: enemySizeVert,
        height: enemySizeVert,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersVert.left,
      };
      const keyTopCenter = "enemyTopCenter_" + Date.now();
      entities[keyTopCenter] = {
        position: enemyPositionsVert.center,
        width: enemySizeVert,
        height: enemySizeVert,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersVert.center,
      };
      const keyTopRight = "enemyTopRight_" + Date.now();
      entities[keyTopRight] = {
        position: enemyPositionsVert.right,
        width: enemySizeVert,
        height: enemySizeVert,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersVert.right,
      };
      
      // Cria os inimigos do modo Default
      const keyRightLeft = "enemyRightLeft_" + Date.now();
      entities[keyRightLeft] = {
        position: enemyPositionsDefault.top,
        width: enemySizeDefault,
        height: enemySizeDefault,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersDefault.left,
      };
      const keyRightCenter = "enemyRightCenter_" + Date.now();
      entities[keyRightCenter] = {
        position: enemyPositionsDefault.center,
        width: enemySizeDefault,
        height: enemySizeDefault,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersDefault.center,
      };
      const keyRightRight = "enemyRightRight_" + Date.now();
      entities[keyRightRight] = {
        position: enemyPositionsDefault.bottom,
        width: enemySizeDefault,
        height: enemySizeDefault,
        createdAt: Date.now(),
        visible: true,
        lastBlink: Date.now(),
        renderer: enemyRenderersDefault.right,
      };
    }
    
    // Adiciona os novos pipes ao array existente
    entities.obstacles.pipes.push(...newPipes);
  }
  
  return entities;
};

// Sistema para fazer os enemies piscarem (toggle de opacidade)
const BlinkSystem = (entities, { time }) => {
  const currentTime = Date.now();
  Object.keys(entities).forEach(key => {
    if (key.startsWith("enemy")) {
      let enemy = entities[key];
      if (!enemy.lastBlink) enemy.lastBlink = currentTime;
      if (currentTime - enemy.lastBlink >= 500) {
        enemy.visible = !enemy.visible;
        enemy.lastBlink = currentTime;
      }
    }
  });
  return entities;
};

// Sistema para remover os enemies após 2 segundos
const EnemySystem = (entities, { time }) => {
  const currentTime = Date.now();
  Object.keys(entities).forEach(key => {
    if (
      key.startsWith("enemy") &&
      entities[key].createdAt &&
      currentTime - entities[key].createdAt >= 2000
    ) {
      delete entities[key];
    }
  });
  return entities;
};

// Cria o mundo inicial com o player, chão e sem obstáculos
const createWorld = (selectedCharacter) => {
  let engine = Matter.Engine.create({ enableSleeping: false });
  engine.world.gravity.y = 0;
  let world = engine.world;

  // Cria o player e impede sua rotação
  let player = Matter.Bodies.rectangle(width / 4, height / 2, 50, 50, { label: "player" });
  player.frictionAir = 0.1;
  Matter.Body.setInertia(player, Infinity); // Impede que o player gire

  
  // Adiciona paredes laterais (topo, base, esquerda e direita)
  const wallThickness = 50;
  const walls = [
    // Parede superior
    Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true, label: 'wallTop' }),
    // Parede inferior
    Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true, label: 'wallBottom' }),
    // Parede esquerda
    Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'wallLeft' }),
    // Parede direita
    Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'wallRight' }),
  ];
  
  Matter.World.add(world, [player,  ...walls]);

  return {
    physics: { engine, world },
    player: {
      body: player,
      isBurst: false,
      renderer: (props) => (
        <Image 
          source={ selectedCharacter 
                    ? (props.isBurst 
                        ? selectedCharacter.burstImage 
                        : selectedCharacter.normalImage)
                    : require("../../assets/Player1.png") }
          style={[
            styles.player, 
            { 
              left: props.body.position.x - 25, 
              top: props.body.position.y - 25, 
              transform: [{ rotate: '0rad' }]
            }
          ]}
        />
      ),
    },
    obstacles: { pipes: [], renderer: Obstacles },
  };
};



const GameScreen = ({ selectedCharacter }) => {
  const [running, setRunning] = useState(true);
  const [entities, setEntities] = useState(createWorld(selectedCharacter));
  const [isBurst, setIsBurst] = useState(false);
  const [restartVisible, setRestartVisible] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now());
  const [life, setLife] = useState(1000);
  const auth = getAuth();
  const db = getDatabase();
  const lastHitRef = useRef(0);
  const [gameLevel, setGameLevel] = useState(null);
// Estado para armazenar o nível quando a partida inicia
const [initialGameLevel, setInitialGameLevel] = useState(null);
// Estado para armazenar a diferença de níveis (consecutivos)
const [levelConsecutivo, setLevelConsecutivo] = useState(0);




const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500  ; // XP necessário para subir de nível
    // Estado para armazenar XP
    const [xp, setXp] = useState(initialXP);
    const [level, setLevel] = useState(initialLevel);
    const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);
  
   // Estado animado para a barra de progresso
   const progress = useRef(new Animated.Value(0)).current;



// Este useEffect adiciona XP automaticamente quando o XP alcança o limite e sobe de nível.
useEffect(() => {
  if (xp >= xpNeeded) {
    const newLevel = level + 1;
    const newXpNeeded = xpNeeded ; // Incremento de 300 a cada nível
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
    setXp(0);  // Resetando o XP quando sobe de nível
  }
}, [xp, xpNeeded, level]);






  useEffect(() => {
    const saveXPToFirebase = async (userId, xp, level) => {
      try {
        const db = getDatabase();
        await set(ref(db, `usuarios/${userId}/xp`), xp);
        await set(ref(db, `usuarios/${userId}/level`), level);
        console.log("XP e nível salvos no Firebase!");
      } catch (error) {
        console.error("Erro ao salvar XP no Firebase:", error);
      }
    };
  
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    if (userId && (xp !== undefined || level !== undefined)) {
      saveXPToFirebase(userId, xp, level);
    }
  }, [xp, level]);
  




  
  // Função para carregar XP e nível do Firebase
  const loadXPFromFirebase = async (userId) => {
  try {
      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${userId}`));
      if (snapshot.exists()) {
          const data = snapshot.val();
          return { xp: data.xp || 0, level: data.level || 1 };
      } else {
          console.log("Nenhum dado encontrado no Firebase.");
          return { xp: 0, level: 1 };
      }
  } catch (error) {
      console.error("Erro ao carregar XP do Firebase:", error);
      return { xp: 0, level: 1 };
  }
  };



// UseEffect para carregar XP e nível ao iniciar o app
useEffect(() => {
  const interval = setInterval(() => {
    const loadData = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (userId) {
        const { xp, level } = await loadXPFromFirebase(userId);
        setXp(xp);
        setLevel(level);
      }
    };
    loadData();
  }, 1000); // 1 segundo

  return () => clearInterval(interval); // Limpa o intervalo ao desmontar
}, []);

  
  // Efeito para animar a barra de progresso
  useEffect(() => {
    Animated.timing(progress, {
      toValue: xp / xpNeeded,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [xp, xpNeeded, progress]); // Adiciona progress como dependência
  
  
  
  // Adicionar XP e subir de nível se necessário
  const addXP = async (amount) => {
    console.log(`Tentando adicionar XP: ${amount}`);
  
    let newXP = xp + amount;
    let newLevel = level;
    let newXpNeeded = xpNeeded;
  
    // Verificar se o jogador deve subir de nível
    while (newXP >= newXpNeeded && newLevel < MAX_LEVEL) {
      newXP -= newXpNeeded;
      newLevel++;
    }
  
    if (newLevel >= MAX_LEVEL) {
      newLevel = MAX_LEVEL;
      newXP = 0;  // Resetar XP após atingir o nível máximo
    }
  
    console.log(`Novo XP: ${newXP}, Novo Nível: ${newLevel}, XP Necessário: ${newXpNeeded}`);
  
    // Atualizar o estado local
    setXp(newXP);
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
  
    // Atualizar no Firebase e AsyncStorage
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    await saveXPToFirebase(userId, newXP, newLevel);
    await AsyncStorage.setItem("xp", newXP.toString());
    await AsyncStorage.setItem("level", newLevel.toString());
  
    console.log("XP atualizado com sucesso!");
  };
  
  
  
  // Salvar XP e nível ao mudar
  // Efeito para salvar XP e nível
  useEffect(() => {
    AsyncStorage.setItem("xp", String(xp ?? 0));
 AsyncStorage.setItem("level", String(level ?? 1));

  }, [xp, level]);

  
  
  
  // Efeito para verificar a subida de nível
  useEffect(() => {
    if (xp >= xpNeeded) {
      setLevel((prevLevel) => prevLevel);
      setXpNeeded((prevXpNeeded) => prevXpNeeded );
      setXp(0);
    }
  
    
  }, [xp]);





  
  
  
  
  

  

  const [xpDiarioEspaco, setXpDiarioEspaco] = useState(0); // XP diário
  
  // Verifica o XP e atualiza quando o componente é montado
  useEffect(() => {
    const verificarXP = async () => {
      if (!auth.currentUser) return;
  
      const userId = auth.currentUser.uid;
      const xpRef = ref(db, `usuarios/${userId}/xp`);
      const xpDiarioRef = ref(db, `usuarios/${userId}/xpDiarioEspaco`);
      
      const [xpSnapshot, xpDiarioSnapshot] = await Promise.all([get(xpRef), get(xpDiarioRef)]);
      
      const currentXP = xpSnapshot.exists() ? xpSnapshot.val() : 0;
      const xpDiarioAtual = xpDiarioSnapshot.exists() ? xpDiarioSnapshot.val() : 0;
  
      setXpDiarioEspaco(xpDiarioAtual); // Atualiza o estado com o XP diário
    };
  
    verificarXP();
  }, []);
  
  // Incrementa o XP sempre que o jogo for finalizado
  useEffect(() => {
    if (gameLevel === null) return; // Se não há nível, não faz nada
  
    const atualizarXP = async () => {
      if (!auth.currentUser) return;
  
      const userId = auth.currentUser.uid;
      const xpRef = ref(db, `usuarios/${userId}/xp`);
      const xpDiarioRef = ref(db, `usuarios/${userId}/xpDiarioEspaco`);
  
      const [xpSnapshot, xpDiarioSnapshot] = await Promise.all([get(xpRef), get(xpDiarioRef)]);
      
      const currentXP = xpSnapshot.exists() ? xpSnapshot.val() : 0;
      const xpDiarioAtual = xpDiarioSnapshot.exists() ? xpDiarioSnapshot.val() : 0;
  
      // Apenas soma o XP sem limitar
      const novoXPDiario = xpDiarioAtual + 3; // Adiciona 100 de XP ao XP diário
      const novoXPTotal = currentXP + 3; // Adiciona 100 ao XP total
  
      await update(ref(db, `usuarios/${userId}`), {
        xp: novoXPTotal, // Atualiza o XP total
        xpDiarioEspaco: novoXPDiario, // Atualiza o XP diário
      });
  
      setXpDiarioEspaco(novoXPDiario); // Atualiza o estado local
    };
  
    atualizarXP();
  }, [gameLevel]); // Quando o gameLevel for alterado, incrementa o XP
  
  
  
  useEffect(() => {
    if (gameLevel !== null) {
      AsyncStorage.setItem("gameLevel", String(gameLevel));
    }
  }, [gameLevel]);




// Carregar gameLevel salvo ao iniciar o jogo
useEffect(() => {
  const loadGameLevel = async () => {
    const storedLevel = await AsyncStorage.getItem("gameLevel");
    if (storedLevel !== null) {
      setGameLevel(Number(storedLevel));
    }
  };
  loadGameLevel();
}, []);

  
useEffect(() => {
  if (gameLevel !== null) {
    AsyncStorage.setItem("gameLevel", String(gameLevel));
  }
}, [gameLevel]);







useEffect(() => {
  if (running && gameLevel !== null && initialGameLevel === null) {
    setInitialGameLevel(gameLevel);
  }
}, [running, gameLevel, initialGameLevel]);

useEffect(() => {
  if (!running && initialGameLevel !== null && gameLevel !== null) {
    setLevelConsecutivo(gameLevel - initialGameLevel);
  }
}, [running, initialGameLevel, gameLevel]);


  
  
  // Atualiza a propriedade isBurst do player
  useEffect(() => {
    setEntities(prev => ({
      ...prev,
      player: prev.player ? { ...prev.player, isBurst: isBurst } : prev.player,
    }));
  }, [isBurst]);




  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const gameLevelRef = ref(db, `usuarios/${userId}/gameLevel`);
      onValue(gameLevelRef, (snapshot) => {
        if (snapshot.exists()) {
          setGameLevel(snapshot.val());
        } else {
          // Se não existir valor, inicializa com 0 (apenas na primeira vez)
          setGameLevel(0);
        }
      });
    }
  }, [auth.currentUser]);
  
  
  
  


  
  // Colisão para diminuir vida (cooldown de 1s)
  useEffect(() => {
    const engine = entities.physics.engine;
    const collisionHandler = (event) => {
      event.pairs.forEach(pair => {
        if (
          (pair.bodyA.label === "player" && pair.bodyB.label === "pipe") ||
          (pair.bodyA.label === "pipe" && pair.bodyB.label === "player")
        ) {
          // Zera a velocidade e a rotação do player
          Matter.Body.setVelocity(entities.player.body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(entities.player.body, 0);
          Matter.Body.setAngle(entities.player.body, 0);
  
          // Aplica a lógica de perda de vida (cooldown de 1s)
          const now = Date.now();
          if (now - lastHitRef.current > 1000) {
            lastHitRef.current = now;
            setLife(prev => {
              const newLife = prev - 50;
              if (newLife <= 0) { setRunning(false); }
              return newLife;
            });
          }
        }
      });
    };
    Matter.Events.on(engine, "collisionStart", collisionHandler);
    return () => { Matter.Events.off(engine, "collisionStart", collisionHandler); };
  }, [entities]);
  
  
  // Incrementa o nível a cada 15s (ciclo de modos baseado em level % 4)
  useEffect(() => {
    const levelInterval = setInterval(() => {
      if (running) { setGameLevel(prev => prev + 1); }
    }, 6666);
    return () => clearInterval(levelInterval);
  }, [running]);
  
  
  // Alterna burst a cada 10s
  useEffect(() => {
    if (!running) return;
    const toggleInterval = setInterval(() => { setIsBurst(prev => !prev); }, 12000);
    return () => clearInterval(toggleInterval);
  }, [running]);
  
  // Botão de reinicialização após 1s do game over
  useEffect(() => {
    if (!running) {
      const pauseTimeout = setTimeout(() => { setRestartVisible(true); }, 1000);
      return () => clearTimeout(pauseTimeout);
    }
  }, [running]);
  
  // Remove a física do player no game over
  useEffect(() => {
    if (!running && entities.player) {
      Matter.World.remove(entities.physics.world, entities.player.body);
      setEntities(prev => ({ ...prev, player: { ...prev.player, renderer: () => null } }));
    }
  }, [running]);
  
  // Reinicia o jogo
  const restartGame = () => {
    setEntities(createWorld(selectedCharacter));
    setRunning(true);
    setIsBurst(false);
    setRestartVisible(false);
    setGameKey(Date.now());
    setLife(1000);
    lastHitRef.current = 0;
  };
  
  const handleJoystickMove = (direction) => {
    if (running && entities.player) {
      const playerBody = entities.player.body;
      const maxSpeed = 1;         // velocidade máxima (ajuste conforme necessário)
      const acceleration = 0.03; // força de aceleração (ajuste conforme necessário)
  
      if (direction.x !== 0 || direction.y !== 0) {
        // Aplica uma força para acelerar gradualmente o player na direção do joystick
        Matter.Body.applyForce(
          playerBody,
          playerBody.position,
          { 
            x: direction.x * acceleration,
            y: direction.y * acceleration,
          }
        );
      } else {
        // Se não houver entrada, aplique uma leve redução na velocidade (damping)
        const currentVel = playerBody.velocity;
        Matter.Body.setVelocity(playerBody, { 
          x: currentVel.x * 4.99, 
          y: currentVel.y * 4.99 
        });
      }
      
      // Limita a velocidade máxima do player
      let vx = playerBody.velocity.x;
      let vy = playerBody.velocity.y;
      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        Matter.Body.setVelocity(playerBody, { x: vx * scale, y: vy * scale });
      }
      
      // Garante que o player não saia dos limites da tela
      const marginX = 40; // ajuste conforme a metade da largura da imagem
      const marginY = 40; // ajuste conforme a metade da altura da imagem
      const pos = playerBody.position;
      const clampedX = Math.max(marginX, Math.min(pos.x, width - marginX));
      const clampedY = Math.max(marginY, Math.min(pos.y, height - marginY));
      Matter.Body.setPosition(playerBody, { x: clampedX, y: clampedY });

    }
  };


  
  const subirNivel = () => setGameLevel((prev) => prev + 1);

  const ganharXp = (valor) => setXp((prev) => prev + valor);

  useEffect(() => {
    if (gameLevel > 1) {
      ganharXp(3);
    }
  }, [gameLevel]);


  useEffect(() => {
    let soundObject;

    const playSound = async () => {
      try {
        soundObject = new Audio.Sound();
        await soundObject.loadAsync(require("../../assets/somGuerraEspacialMusica.mp3")); // 🔥 Certifique-se de usar require()
        await soundObject.setIsLoopingAsync(true);
        await soundObject.setVolumeAsync(0.5); // Ajusta o volume (opcional)
        await soundObject.playAsync();
      } catch (error) {
        console.log("Erro ao reproduzir o áudio:", error);
      }
    };

    playSound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync(); // Libera a memória ao desmontar o componente
      }
    };
  }, []);
  

  
  return (
    <View style={styles.backgroundContainer}>
      <Image source={bgImage} style={styles.absoluteBackground} />
      <View style={styles.gameContainer}>
        <GameEngine
          key={gameKey}
          running={running}
          style={styles.engineContainer}
          systems={[
            (entities, args) => PhysicsSystem(entities, { ...args, isBurst, level: gameLevel }),
            (entities, args) => PipeSpawner(entities, { ...args, level: gameLevel }),
            BlinkSystem,
            EnemySystem,
          ]}
          entities={entities}
        >
          <Text style={styles.levelText}>Level: {gameLevel}</Text>
          {isBurst && <Text style={styles.burstText}>Burst Mode!</Text>}
          {!running && <Text style={styles.gameOverText}>Game Over</Text>}
        </GameEngine>
        {(!running && restartVisible) && (
  <View style={{ alignItems: 'center' }}>
    <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
      <Text style={styles.restartButtonText}>Jogar Novamente</Text>
    </TouchableOpacity>
    <Text style={styles.consecutiveLevelText}>
      Você completou {levelConsecutivo} níveis até agora, continue!
    </Text>
   
  </View>
)}
 <View style={{margin:30, zIndex:100}}>
          <Text style ={styles.neonText2}>XP adquirido: {xpDiarioEspaco}</Text> {/* Exibe o XP diário para o usuário */}
        </View>
        <View style={styles.healthBarContainer}>
          <View style={[styles.healthBar, { width: (life/300)*100 }]} />
          <Text style={styles.healthText}>⚡{life}⚡ </Text>
        </View>
        <View style={styles.joystickContainer}>
          <Joystick key={gameKey + "-joystick"} size={90} onMove={handleJoystickMove} />
        </View>
      </View>
    </View>
  );
};

// Tela de seleção de personagens
const CharacterSelectionScreen = ({ onSelectCharacter }) => {
  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>Escolha Seu Guerreiro</Text>
      <ScrollView contentContainerStyle={styles.characterList}>
        {characters.map(character => (
          <TouchableOpacity key={character.id} style={styles.characterCard} onPress={() => onSelectCharacter(character)}>
            <Image source={character.normalImage} style={styles.characterImage} />
            <Text style={styles.characterName}>{character.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const App = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  return (
    <View style={{ flex: 1 }}>
      {selectedCharacter ? (
        <GameScreen selectedCharacter={selectedCharacter} />
      ) : (
        <CharacterSelectionScreen onSelectCharacter={setSelectedCharacter} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: { flex: 1, position: "relative" },
  absoluteBackground: { ...StyleSheet.absoluteFillObject, resizeMode: "repeat" },
  gameContainer: { flex: 1, justifyContent: "center", alignItems: "center", },
  engineContainer: { width: width, height: height, backgroundColor: "transparent" },
  player: { position: "absolute", width: width*0.08, height: 80, resizeMode: "contain" },
  ground: { position: "absolute", height: 100, backgroundColor: "#202020" },
  pipe: { position: "absolute", resizeMode: "contain",  },
  gameOverContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  gameOverText: {
    fontSize: 40, fontWeight: "bold", color: "#FF3EB5",
    position: "absolute", top: height * 0.45, alignSelf: "center",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  levelText: {
    fontSize: 20, fontWeight: "bold", color: "#3ee3f3",
    position: "absolute", top: 0, alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)", padding: 5, borderRadius: 10,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  burstText: {
    fontSize: 18, fontWeight: "bold", color: "#FF3EB5",
    position: "absolute", alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 10,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    top: width * 0.4,
  },
  restartButton: {
    position: "absolute", bottom: width*0.1, backgroundColor: "transparent",
    paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1,
    padding: 10, borderRadius: 10, borderTopWidth: 0.3, borderColor: "white", margin: 50, 
  },
  restartButtonText: {
    color: "#fff", fontSize: 18, fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  joystickContainer: { position: "relative", bottom: width*0.05, alignItems: "center", justifyContent:'center', alignItems:'center', },
  healthBarContainer: {
    position: "absolute", top: width*0.25, alignSelf: "center", width: 200, height: 20,
    borderColor: "transparent", borderWidth: 1, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  healthBar: { height: "90%", backgroundColor: "white", borderRadius: 10 },
  healthText: { position: "absolute", alignSelf: "center", color: "#202020", fontWeight: "bold", fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif"  },
  selectionContainer: { flex: 1, backgroundColor: "#202020", justifyContent: "center", alignItems: "center", top:0,  },
  selectionTitle: { fontSize: 20, color: "#fff", marginBottom: 20, fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif", textAlign:'center',marginTop:10 },
  characterList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  characterCard: { margin: 10, alignItems: "center" },
  characterImage: { width: 150, height: 100, borderRadius: 10, resizeMode: "contain", margin: 5 },
  characterName: { marginTop: 10, fontSize: 16, color: "#fff", fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif" },
  consecutiveLevelText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  neonText2: {
    color: "#3ee3f3", // Cor do texto neon
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    textShadowColor: "#black", // Cor da sombra (mesma do neon)
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
    animation: "neonBlink 1s infinite", // Efeito de neon piscando
    transition: "text-shadow 0.5s ease-in-out",
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },

  '@keyframes neonBlink': {
    '0%': {
      textShadow: '10px 0 10px #202020, 0 0 30px #202020, 0 0 30px #202020',
      color: "#202020",
    },
    '50%': {
      textShadow: '10px 0 5px #202020',
      color: "#202020",
    },
    '100%': {
      textShadow: '10px 0 10px #202020, 0 0 30px #202020, 0 0 30px #202020',
      color: "#202020",
    },
  },
});

export default App;
