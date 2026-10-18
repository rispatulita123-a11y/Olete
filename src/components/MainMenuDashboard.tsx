/**
 * MainMenuDashboard.tsx
 * Ultra-Modern 2026 Esports Racing Operations Dashboard for Apex GT.
 * Inspired by Gran Turismo 7 & F1 24 luxury motorsport editorial design.
 * 
 * Features:
 * - 90% opacity full-screen custom background image with dark cinematic vignette
 * - Root view: 2x2 panoramic grid with 40% translucent rounded cards (Modo Carrera, Modo Libre, Multijugador, Gran Premio)
 * - Two-Panel Dedicated Sub-screens:
 *   - Left Panel: Interactive Circuit Blueprint SVG, Live Track Weather & Grip Index, Monoplaza 1050 HP Powertrain Dossier
 *   - Right Panel: 2026 Precision Capsule Command Center (Circuits, FIA Tires, Laps, AI Difficulty, Camera, Driving Assists)
 * - Subtle non-intrusive Free Camera button
 * - Zero 3D model uploading clutter
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Timer,
  Users,
  Flag,
  Play,
  ArrowLeft,
  Check,
  Copy,
  Zap,
  Compass,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Palette,
  Shield,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Flame,
  Wind,
  Thermometer,
  Gauge,
  CircleDot,
  Radio,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { CameraDistanceMode, CameraViewMode } from '../game/RacingGameEngine';
import { MultiplayerRoomState } from '../game/multiplayer/MultiplayerClient';
import { RaceDifficulty, RaceLapOption, CustomLiverySettings, CareerSeasonState } from '../game/career/CareerTypes';
import { TireCompoundType } from '../game/physics/TireCompound';
import { playUiClick, playUiHover, playModeSelectChime } from '../utils/uiAudio';
import { CircuitId } from '../game/circuits/ICircuit';
import { AVAILABLE_CIRCUITS } from '../game/circuits/CircuitRegistry';

export interface MainMenuDashboardProps {
  onStartSolo: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    laps: RaceLapOption,
    difficulty: RaceDifficulty,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  onStartCareerMode?: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    laps: RaceLapOption,
    difficulty: RaceDifficulty,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  onOpenLiveryStudio?: () => void;
  customLivery?: CustomLiverySettings;
  careerSeason?: CareerSeasonState;
  onResetCareerSeason?: () => void;
  onStartFreePractice?: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  selectedCircuit?: CircuitId;
  onSelectCircuit?: (circuitId: CircuitId) => void;
  onCreateRoom: (options: {
    playerName: string;
    laps: number;
    car1Name: string;
    car2Name: string;
    crewName: string;
    cameraDistance: CameraDistanceMode;
    cameraMode: CameraViewMode;
  }) => Promise<void>;
  onJoinRoom: (code: string, playerName: string, cameraDistance: CameraDistanceMode, cameraMode: CameraViewMode) => Promise<void>;
  onStartMultiplayerRace: () => void;
  onSetReady: (isReady: boolean) => void;
  onLeaveRoom: () => void;
  onBackToTitle: () => void;
  roomState: MultiplayerRoomState | null;
  playerId: 'p1' | 'p2' | null;
  isConnecting: boolean;
  errorMessage: string | null;
  onStartFreeCamera?: (circuitId?: CircuitId) => void;
  // Deprecated stubs
  onOpenModelUpload?: (target: 'car1' | 'car2' | 'crew') => void;
  car1Name?: string;
  car2Name?: string;
  crewName?: string;
}

export type MenuDedicatedScreen = 'root' | 'career' | 'free' | 'multiplayer' | 'grand_prix';

export const MainMenuDashboard: React.FC<MainMenuDashboardProps> = ({
  onStartSolo,
  onStartCareerMode,
  onOpenLiveryStudio,
  customLivery,
  careerSeason,
  onStartFreePractice,
  selectedCircuit: initialCircuit,
  onSelectCircuit,
  onCreateRoom,
  onJoinRoom,
  onStartMultiplayerRace,
  onSetReady,
  onLeaveRoom,
  onBackToTitle,
  roomState,
  playerId,
  isConnecting,
  errorMessage,
  onStartFreeCamera,
}) => {
  // Navigation State: 'root' (2x2 grid) or dedicated mode screen
  const [activeScreen, setActiveScreen] = useState<MenuDedicatedScreen>(() => {
    return roomState ? 'multiplayer' : 'root';
  });

  // Automatically switch to multiplayer screen if room state updates
  useEffect(() => {
    if (roomState && activeScreen !== 'multiplayer') {
      setActiveScreen('multiplayer');
    }
  }, [roomState, activeScreen]);

  // Selected Circuit
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitId>(initialCircuit || 'square_apex');

  // Racing Parameters
  const [laps, setLaps] = useState<RaceLapOption>(9);
  const [difficulty, setDifficulty] = useState<RaceDifficulty>('medium');
  const [startingCompound, setStartingCompound] = useState<TireCompoundType>('soft');

  // Camera Settings
  const [cameraDistance, setCameraDistance] = useState<CameraDistanceMode>('medium');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');

  // Driving Assists (Capsule Toggles)
  const [tractionControl, setTractionControl] = useState<boolean>(true);
  const [absEnabled, setAbsEnabled] = useState<boolean>(true);
  const [racingLine, setRacingLine] = useState<boolean>(true);

  // Multiplayer Form State
  const [mpTab, setMpTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState<string>(customLivery?.driverName || 'PILOTO APEX');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [mpLaps, setMpLaps] = useState<number>(3);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Controls Guide Modal
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    playUiClick(750);
    try {
      if (!document.fullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if ((root as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
          (root as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
          (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
        }
      }
    } catch {}
  };

  const handleSelectCircuitLocal = (id: CircuitId) => {
    playUiClick(650);
    setSelectedCircuit(id);
    onSelectCircuit?.(id);
  };

  const handleNavigateToScreen = (screen: MenuDedicatedScreen) => {
    playModeSelectChime();
    setActiveScreen(screen);
  };

  const handleBackToGrid = () => {
    playUiClick(700);
    setActiveScreen('root');
  };

  // Launch handlers for each dedicated screen
  const handleLaunchCareer = () => {
    playUiClick(950);
    if (onStartCareerMode) {
      onStartCareerMode(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
    } else {
      onStartSolo(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
    }
  };

  const handleLaunchFreePractice = () => {
    playUiClick(950);
    if (onStartFreePractice) {
      onStartFreePractice(cameraDistance, cameraMode, startingCompound, selectedCircuit);
    } else {
      onStartSolo(cameraDistance, cameraMode, 9, 'easy', startingCompound, selectedCircuit);
    }
  };

  const handleLaunchGrandPrix = () => {
    playUiClick(950);
    onStartSolo(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
  };

  const handleLaunchFreeCamera = () => {
    playUiClick(750);
    if (onStartFreeCamera) {
      onStartFreeCamera(selectedCircuit);
    } else if (onStartFreePractice) {
      onStartFreePractice(cameraDistance, cameraMode, startingCompound, selectedCircuit);
    }
  };

  const handleCreateRoomAction = async () => {
    playUiClick(850);
    await onCreateRoom({
      playerName: playerName.trim() || 'Piloto Anfitrión',
      laps: mpLaps,
      car1Name: 'F1 Turbo GP (Host)',
      car2Name: 'F1 Turbo GP (Rival)',
      crewName: 'Pit Crew Scuderia',
      cameraDistance,
      cameraMode,
    });
  };

  const handleJoinRoomAction = async () => {
    if (!joinCodeInput.trim()) return;
    playUiClick(850);
    await onJoinRoom(
      joinCodeInput.trim().toUpperCase(),
      playerName.trim() || 'Piloto Invitado',
      cameraDistance,
      cameraMode
    );
  };

  const handleToggleReady = () => {
    playUiClick(800);
    const next = !isReady;
    setIsReady(next);
    onSetReady(next);
  };

  const copyRoomCode = () => {
    if (!roomState?.code) return;
    navigator.clipboard.writeText(roomState.code);
    setIsCopied(true);
    playUiClick(900);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentCircuit = AVAILABLE_CIRCUITS.find((c) => c.id === selectedCircuit) || AVAILABLE_CIRCUITS[0];

  // Career stats calculation
  const playerStanding = careerSeason?.standings?.find((s) => s.isPlayer);
  const playerPoints = playerStanding?.points ?? 0;
  const playerRank = playerStanding
    ? `P${careerSeason?.standings ? careerSeason.standings.indexOf(playerStanding) + 1 : 1}`
    : 'P1';

  // Environmental telemetry tailored per circuit
  const weatherSpecs = {
    square_apex: {
      asphaltTemp: '34°C',
      airTemp: '25°C',
      weather: 'DESPEJADO',
      humidity: '46%',
      wind: '8 KM/H SO',
      gripIndex: '98.8%',
      airDensity: '1.18 KG/M³',
    },
    speedway_gp: {
      asphaltTemp: '37°C',
      airTemp: '28°C',
      weather: 'ÓPTIMO',
      humidity: '39%',
      wind: '4 KM/H N',
      gripIndex: '99.6%',
      airDensity: '1.16 KG/M³',
    },
    singapore_marina: {
      asphaltTemp: '29°C',
      airTemp: '27°C',
      weather: 'NOCTURNO',
      humidity: '74%',
      wind: '6 KM/H E',
      gripIndex: '97.2%',
      airDensity: '1.20 KG/M³',
    },
  }[currentCircuit.id] || {
    asphaltTemp: '33°C',
    airTemp: '26°C',
    weather: 'SECO',
    humidity: '48%',
    wind: '7 KM/H',
    gripIndex: '98.5%',
    airDensity: '1.18 KG/M³',
  };

  // Estimated race duration calculation
  const calculateEstimatedTime = (totalLaps: number) => {
    const lapTime = currentCircuit.expectedLapTimeSec || 35;
    const totalSecs = lapTime * totalLaps;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.round(totalSecs % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none text-white font-sans bg-neutral-950">
      {/* ========================================================================= */}
      {/* BACKGROUND IMAGE WITH 90% OPACITY & CINEMATIC VIGNETTE                   */}
      {/* ========================================================================= */}
      <img
        src="/images/dashboard_bg.webp"
        alt="Racing Background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 select-none z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/80 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-neutral-950/30 to-neutral-950/70 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 shadow-lg">
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3">
          {activeScreen === 'root' ? (
            <button
              onClick={() => {
                playUiClick(750);
                onBackToTitle();
              }}
              onMouseEnter={playUiHover}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-200 hover:text-white transition-all text-xs font-semibold tracking-wider cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PANTALLA DE TÍTULO</span>
            </button>
          ) : (
            <button
              onClick={handleBackToGrid}
              onMouseEnter={playUiHover}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-100 hover:text-white transition-all text-xs font-bold tracking-wider cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLVER AL MENÚ</span>
            </button>
          )}

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <span className="font-black text-sm tracking-widest text-white uppercase font-mono">APEX GT</span>
            <span className="text-[11px] text-red-400 font-bold tracking-widest uppercase hidden md:inline font-mono">
              {activeScreen === 'root' && '// SELECCIÓN DE MODALIDAD'}
              {activeScreen === 'career' && '// MODO CARRERA 2026 · PADDOCK'}
              {activeScreen === 'free' && '// ENTRENAMIENTO & TIME ATTACK'}
              {activeScreen === 'multiplayer' && '// MULTIJUGADOR 1V1 TELEMETRÍA'}
              {activeScreen === 'grand_prix' && '// GRAN PREMIO OFICIAL FIA'}
            </span>
          </div>
        </div>

        {/* Center: GT7 Editorial Season Lockup */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-1 rounded-full bg-neutral-900/80 border border-white/15 text-neutral-300 text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>GRAN TURISMO SPEC // FIA 2026 MOTORSPORT</span>
        </div>

        {/* Right: Subtle Free Camera + Controls + Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleLaunchFreeCamera}
            onMouseEnter={playUiHover}
            title="Explorar el circuito libremente con cámara flotante"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white text-xs font-medium tracking-wide transition-all shadow-sm cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Cámara Libre</span>
          </button>

          <button
            onClick={() => {
              playUiClick(800);
              setShowControlsModal(true);
            }}
            onMouseEnter={playUiHover}
            title="Guía de mandos y teclado"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white text-xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Controles</span>
          </button>

          <button
            onClick={toggleFullscreen}
            onMouseEnter={playUiHover}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (F)'}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW SWITCHER: ROOT 2x2 vs TWO-PANEL GT7 DEDICATED SCREENS        */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* ----------------------------------------------------------------------- */}
        {/* ROOT 2x2 PANORAMIC GRID (40% TRANSLUCENT CARDS OVER 90% BG)            */}
        {/* ----------------------------------------------------------------------- */}
        {activeScreen === 'root' && (
          <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
            <div className="mb-4 sm:mb-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-400 font-mono">
                TEMPORADA COMPETITIVA FIA 2026
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mt-1 drop-shadow-md">
                ELIGE TU EXPERIENCIA DE CARRERA
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl mx-auto">
                Selecciona una modalidad para acceder al dossier técnico y estación de mando.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1 items-stretch">
              {/* CARD 1: MODO CARRERA */}
              <button
                onClick={() => handleNavigateToScreen('career')}
                onMouseEnter={playUiHover}
                className="group text-left relative rounded-3xl p-6 sm:p-8 bg-neutral-950/40 backdrop-blur-xl border border-white/15 hover:border-amber-400/70 hover:bg-neutral-900/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-md">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      TRAYECTORIA FIA
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white group-hover:text-amber-300 transition-colors">
                    MODO CARRERA
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                    Compite en la temporada mundial completa, escala en la tabla de puntos FIA, gestiona tu escudería y personaliza la librea de tu monoplaza.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 tracking-wider">
                    {playerPoints > 0 ? `${playerPoints} PTS FIA · ${playerRank}` : '5 GRANDES PREMIOS'}
                  </span>
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 group-hover:bg-amber-500 group-hover:text-black text-white text-xs font-bold transition-all">
                    <span>CONFIGURAR</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* CARD 2: MODO LIBRE */}
              <button
                onClick={() => handleNavigateToScreen('free')}
                onMouseEnter={playUiHover}
                className="group text-left relative rounded-3xl p-6 sm:p-8 bg-neutral-950/40 backdrop-blur-xl border border-white/15 hover:border-cyan-400/70 hover:bg-neutral-900/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-md">
                      <Timer className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      TIME ATTACK
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white group-hover:text-cyan-300 transition-colors">
                    MODO LIBRE
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                    Entrenamiento puro en pista abierta sin tráfico ni límites. Perfecciona tus puntos de frenada, optimiza la telemetría y bate el récord de vuelta.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 tracking-wider">
                    PISTA ABIERTA · SIN RIVALES
                  </span>
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 group-hover:bg-cyan-400 group-hover:text-black text-white text-xs font-bold transition-all">
                    <span>RODAR</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* CARD 3: MULTIJUGADOR */}
              <button
                onClick={() => handleNavigateToScreen('multiplayer')}
                onMouseEnter={playUiHover}
                className="group text-left relative rounded-3xl p-6 sm:p-8 bg-neutral-950/40 backdrop-blur-xl border border-white/15 hover:border-emerald-400/70 hover:bg-neutral-900/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      DUELO 1V1 ONLINE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white group-hover:text-emerald-300 transition-colors">
                    MULTIJUGADOR
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                    Crea una sala privada o únete con el código de un amigo. Servidor WebSocket de baja latencia con telemetría en tiempo real y semáforo sincronizado.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 tracking-wider">
                    {roomState ? `SALA ACTIVA: ${roomState.code}` : 'PADDOCK PRIVADO'}
                  </span>
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 group-hover:bg-emerald-400 group-hover:text-black text-white text-xs font-bold transition-all">
                    <span>LOBBY</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* CARD 4: GRAN PREMIO */}
              <button
                onClick={() => handleNavigateToScreen('grand_prix')}
                onMouseEnter={playUiHover}
                className="group text-left relative rounded-3xl p-6 sm:p-8 bg-neutral-950/40 backdrop-blur-xl border border-white/15 hover:border-red-500/70 hover:bg-neutral-900/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-md">
                      <Flag className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/15 border border-red-500/30 text-red-300">
                      PARRILLA 5 MONOPLAZAS
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white group-hover:text-red-300 transition-colors">
                    GRAN PREMIO
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                    Carrera contra rivales con IA competitiva, salida desde parrilla con semáforo FIA de 5 luces rojas, desgaste de gomas y paradas en boxes.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 tracking-wider">
                    SALIDA PARADA · PIT STOPS
                  </span>
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 group-hover:bg-red-500 group-hover:text-white text-white text-xs font-bold transition-all">
                    <span>CONFIGURAR</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* DEDICATED GT7 TWO-PANEL SUB-SCREENS (EDITORIAL MOTORSPORT UI)            */}
        {/* ----------------------------------------------------------------------- */}
        {activeScreen !== 'root' && (
          <div className="flex-1 flex flex-col justify-between py-2 w-full animate-in fade-in duration-300">
            {/* Top Bar for Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border ${
                  activeScreen === 'career' ? 'bg-amber-500/20 border-amber-400/50 text-amber-400' :
                  activeScreen === 'free' ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' :
                  activeScreen === 'multiplayer' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' :
                  'bg-red-500/20 border-red-400/50 text-red-400'
                }`}>
                  {activeScreen === 'career' && <Trophy className="w-6 h-6" />}
                  {activeScreen === 'free' && <Timer className="w-6 h-6" />}
                  {activeScreen === 'multiplayer' && <Users className="w-6 h-6" />}
                  {activeScreen === 'grand_prix' && <Flag className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                      {activeScreen === 'career' && 'MODO CARRERA 2026'}
                      {activeScreen === 'free' && 'ENTRENAMIENTO & TIME ATTACK'}
                      {activeScreen === 'multiplayer' && 'PADDOCK MULTIJUGADOR 1V1'}
                      {activeScreen === 'grand_prix' && 'GRAN PREMIO OFICIAL FIA'}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/15 text-neutral-300">
                      AAA GT SPEC
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {activeScreen === 'career' && 'Gestión de campeonato mundial y desarrollo de escudería'}
                    {activeScreen === 'free' && 'Práctica libre en pista abierta sin tráfico para calibrar telemetría'}
                    {activeScreen === 'multiplayer' && 'Duelo en tiempo real con servidor de sincronización WebSocket'}
                    {activeScreen === 'grand_prix' && 'Parrilla de 5 monoplazas con semáforo FIA, estrategia y boxes'}
                  </p>
                </div>
              </div>

              {/* Auxiliary Quick Actions */}
              {activeScreen === 'career' && onOpenLiveryStudio && (
                <button
                  onClick={() => {
                    playUiClick(750);
                    onOpenLiveryStudio();
                  }}
                  onMouseEnter={playUiHover}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Palette className="w-4 h-4" />
                  <span>ESTUDIO DE LIBREA</span>
                </button>
              )}
            </div>

            {/* TWO-PANEL GT7 LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
              {/* ================================================================= */}
              {/* LEFT PANEL: CIRCUIT BLUEPRINT & TELEMETRY DOSSIER (5 COLS)        */}
              {/* ================================================================= */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Track Blueprint Card */}
                <div className="rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{currentCircuit.flagEmoji || '🏁'}</span>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {currentCircuit.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-500/30">
                      {(currentCircuit.totalLength / 1000).toFixed(2)} KM
                    </span>
                  </div>

                  {/* SVG Circuit Blueprint */}
                  <div className="h-44 sm:h-48 w-full flex items-center justify-center p-2 relative bg-neutral-900/40 rounded-2xl border border-white/5 my-2">
                    <svg viewBox="0 0 280 160" className="w-full h-full stroke-current drop-shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                      {/* Grid blueprint backdrop */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Schematic Path per circuit */}
                      {currentCircuit.id === 'square_apex' && (
                        <g>
                          <path
                            d="M 50,30 L 230,30 Q 250,30 250,50 L 250,110 Q 250,130 230,130 L 50,130 Q 30,130 30,110 L 30,50 Q 30,30 50,30 Z"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Inner Pit Lane */}
                          <path
                            d="M 60,118 L 220,118"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          {/* Start/Finish Line */}
                          <line x1="140" y1="124" x2="140" y2="136" stroke="#ffffff" strokeWidth="3" />
                          <circle cx="140" cy="130" r="4" fill="#ef4444" />
                        </g>
                      )}

                      {currentCircuit.id === 'speedway_gp' && (
                        <g>
                          <path
                            d="M 40,120 L 210,120 C 265,120 265,40 210,40 L 110,40 C 85,40 85,75 105,80 C 130,85 130,105 105,108 L 60,108 C 25,108 25,120 40,120 Z"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line x1="120" y1="114" x2="120" y2="126" stroke="#ffffff" strokeWidth="3" />
                          <circle cx="120" cy="120" r="4" fill="#ef4444" />
                        </g>
                      )}

                      {currentCircuit.id === 'singapore_marina' && (
                        <g>
                          <path
                            d="M 35,125 L 90,125 Q 110,125 120,105 L 145,55 Q 155,35 180,35 L 235,35 Q 255,35 250,60 L 240,100 Q 235,120 215,120 L 160,120 Q 145,120 145,135 Q 145,145 130,145 L 60,145 Q 35,145 35,125 Z"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line x1="60" y1="120" x2="60" y2="130" stroke="#ffffff" strokeWidth="3" />
                          <circle cx="60" cy="125" r="4" fill="#06b6d4" />
                        </g>
                      )}
                    </svg>

                    <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>TRAZADA TELEMETRÍA FIA</span>
                    </div>
                  </div>

                  {/* 4 Technical Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block uppercase">LONGITUD</span>
                      <span className="text-xs font-bold text-white">{(currentCircuit.totalLength / 1000).toFixed(2)} km</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block uppercase">CURVAS</span>
                      <span className="text-xs font-bold text-white">{currentCircuit.cornersCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block uppercase">V. MÁXIMA</span>
                      <span className="text-xs font-bold text-amber-400">{currentCircuit.topSpeedKmh} km/h</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block uppercase">RÉCORD</span>
                      <span className="text-xs font-bold text-cyan-400">{currentCircuit.expectedLapTimeSec ? `${currentCircuit.expectedLapTimeSec.toFixed(1)}s` : '32.4s'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Live Weather & Grip Telemetry Card */}
                <div className="rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 p-4 shadow-xl font-mono">
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-amber-400" />
                      CONDICIONES DE PISTA EN VIVO
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      {weatherSpecs.weather}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block">ASFALTO</span>
                      <span className="font-bold text-amber-400 text-sm">{weatherSpecs.asphaltTemp}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block">AIRE</span>
                      <span className="font-bold text-white text-sm">{weatherSpecs.airTemp}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[9px] text-neutral-400 block">AGARRE</span>
                      <span className="font-bold text-emerald-400 text-sm">{weatherSpecs.gripIndex}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 px-1">
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> Viento: {weatherSpecs.wind}</span>
                    <span>Humedad: {weatherSpecs.humidity}</span>
                    <span>Densidad: {weatherSpecs.airDensity}</span>
                  </div>
                </div>

                {/* 3. Monoplaza GT7 Powertrain Specs */}
                <div className="rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
                        ESPECIFICACIÓN MONOPLAZA F1
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {customLivery?.teamName || 'Oracle Red Bull Racing'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Propulsor</span>
                      <span className="font-bold text-neutral-200">3.0L V10 Híbrido Turbo (1.050 CV)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Régimen Máximo</span>
                      <span className="font-bold text-red-400">18.500 RPM</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Masa en Seco</span>
                      <span className="font-bold text-neutral-200">798 kg (Reglamento FIA)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Balance Aero DRS</span>
                      <span className="font-bold text-cyan-400">43% Ant / 57% Post · Activo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* RIGHT PANEL: 2026 CAPSULE COMMAND CENTER (7 COLS)                 */}
              {/* ================================================================= */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Circuit Selector Capsule Group */}
                <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 font-mono">
                      <Compass className="w-4 h-4 text-red-400" />
                      CIRCUITO DE COMPETICIÓN
                    </span>
                    <span className="text-[11px] font-bold text-red-400 font-mono">
                      {AVAILABLE_CIRCUITS.findIndex((c) => c.id === selectedCircuit) + 1} DE {AVAILABLE_CIRCUITS.length} TRAZADOS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_CIRCUITS.map((c) => {
                      const isSelected = selectedCircuit === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCircuitLocal(c.id)}
                          onMouseEnter={playUiHover}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                            isSelected
                              ? 'bg-red-600/25 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white'
                              : 'bg-white/5 border-white/10 hover:border-white/30 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{c.flagEmoji || '🏁'}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                          </div>
                          <div className="mt-2">
                            <div className="text-xs font-black uppercase tracking-wide truncate">{c.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                              {(c.totalLength / 1000).toFixed(1)} km · {c.cornersCount} Curvas
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. MODE SPECIFIC CONFIGURATORS */}
                {/* -------------------- MODO CARRERA EXCLUSIVE -------------------- */}
                {activeScreen === 'career' && (
                  <>
                    {/* Race Distance */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 font-mono">
                          <Activity className="w-4 h-4 text-amber-400" />
                          DURACIÓN DEL GRAN PREMIO
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 font-bold">
                          Tiempo estimado: {calculateEstimatedTime(laps)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 font-mono">
                        {[
                          { val: 9 as RaceLapOption, label: '9 VUELTAS', sub: 'Sprint Relámpago' },
                          { val: 20 as RaceLapOption, label: '20 VUELTAS', sub: 'Gran Premio Estándar' },
                          { val: 50 as RaceLapOption, label: '50 VUELTAS', sub: 'Resistencia Completa' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => {
                              playUiClick(700);
                              setLaps(item.val);
                            }}
                            onMouseEnter={playUiHover}
                            className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              laps === item.val
                                ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                                : 'bg-white/5 border-white/10 hover:border-white/25 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-black">{item.label}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Difficulty */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 mb-3 font-mono">
                        <Zap className="w-4 h-4 text-amber-400" />
                        NIVEL DE COMPETITIVIDAD (IA)
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'easy' as RaceDifficulty, name: 'NOVATO', desc: 'Ritmo accesible' },
                          { id: 'medium' as RaceDifficulty, name: 'INTERMEDIO', desc: 'Competitivo equilibrado' },
                          { id: 'hard' as RaceDifficulty, name: 'LEYENDA FIA', desc: 'Máxima agresividad' },
                        ].map((diff) => (
                          <button
                            key={diff.id}
                            onClick={() => {
                              playUiClick(700);
                              setDifficulty(diff.id);
                            }}
                            onMouseEnter={playUiHover}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              difficulty === diff.id
                                ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-black">{diff.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{diff.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* -------------------- MODO LIBRE EXCLUSIVE -------------------- */}
                {activeScreen === 'free' && (
                  <>
                    {/* Camera Perspective Capsules */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 mb-3 font-mono">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        PUNTO DE VISTA & CÁMARA
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'chase' as CameraViewMode, label: 'PERSECUCIÓN', sub: '3ª Persona Dinámica' },
                          { id: 'cockpit' as CameraViewMode, label: 'COCKPIT F1', sub: 'Halo & Volante Real' },
                          { id: 'hood' as CameraViewMode, label: 'MORRO FRONTAL', sub: 'Visión Pura de Pista' },
                          { id: 'isometric' as CameraViewMode, label: 'TELEVISIÓN TV', sub: 'Transmisión Exterior' },
                        ].map((cam) => (
                          <button
                            key={cam.id}
                            onClick={() => {
                              playUiClick(700);
                              setCameraMode(cam.id);
                            }}
                            onMouseEnter={playUiHover}
                            className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                              cameraMode === cam.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-black">{cam.label}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{cam.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Driving Assists Capsule Toggles */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 mb-3 font-mono">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        AYUDAS ELECTRÓNICAS DE CONDUCCIÓN
                      </span>
                      <div className="grid grid-cols-3 gap-2.5 font-mono">
                        <button
                          onClick={() => {
                            playUiClick(700);
                            setTractionControl(!tractionControl);
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            tractionControl
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-500'
                          }`}
                        >
                          <div className="text-xs font-black">CONTROL TRACCIÓN</div>
                          <div className="text-[10px] mt-0.5">{tractionControl ? 'ACTIVADO' : 'OFF'}</div>
                        </button>

                        <button
                          onClick={() => {
                            playUiClick(700);
                            setAbsEnabled(!absEnabled);
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            absEnabled
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-500'
                          }`}
                        >
                          <div className="text-xs font-black">FRENOS ABS</div>
                          <div className="text-[10px] mt-0.5">{absEnabled ? 'ACTIVADO' : 'OFF'}</div>
                        </button>

                        <button
                          onClick={() => {
                            playUiClick(700);
                            setRacingLine(!racingLine);
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            racingLine
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-500'
                          }`}
                        >
                          <div className="text-xs font-black">TRAZADA DINÁMICA</div>
                          <div className="text-[10px] mt-0.5">{racingLine ? 'VISIBLE' : 'OFF'}</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* -------------------- MULTIJUGADOR EXCLUSIVE -------------------- */}
                {activeScreen === 'multiplayer' && (
                  <div className="space-y-4">
                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center gap-2 text-red-200 text-xs font-mono">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {!roomState ? (
                      <>
                        {/* Tab Toggle: Create vs Join */}
                        <div className="flex p-1.5 rounded-2xl bg-neutral-900/80 border border-white/15">
                          <button
                            onClick={() => {
                              playUiClick(700);
                              setMpTab('create');
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer font-mono ${
                              mpTab === 'create'
                                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            CREAR NUEVA SALA PRIVADA
                          </button>
                          <button
                            onClick={() => {
                              playUiClick(700);
                              setMpTab('join');
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer font-mono ${
                              mpTab === 'join'
                                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            UNIRSE CON CÓDIGO PIN
                          </button>
                        </div>

                        {/* Driver Name Input */}
                        <div className="p-4 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1.5 font-mono">
                            NOMBRE DE PILOTO EN EL SERVIDOR
                          </span>
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.toUpperCase().slice(0, 16))}
                            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm tracking-wider outline-none focus:border-emerald-400 uppercase"
                          />
                        </div>

                        {mpTab === 'create' ? (
                          <div className="p-4 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2 font-mono">
                              VUELTAS DEL DUELO 1V1
                            </span>
                            <div className="grid grid-cols-4 gap-2 font-mono">
                              {[1, 3, 5, 10].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => {
                                    playUiClick(700);
                                    setMpLaps(num);
                                  }}
                                  className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                    mpLaps === num
                                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-black'
                                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  <span className="text-xs">{num} {num === 1 ? 'VUELTA' : 'VUELTAS'}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 text-center space-y-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 block font-mono">
                              CÓDIGO DE SALA PRIVADA
                            </span>
                            <input
                              type="text"
                              value={joinCodeInput}
                              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                              placeholder="APEX-XXXX"
                              className="w-full max-w-xs mx-auto py-3 px-4 text-center rounded-2xl bg-white/5 border-2 border-white/20 text-white font-mono font-black text-xl tracking-[0.25em] outline-none focus:border-emerald-400 uppercase"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      /* PADDOCK STATUS WHEN IN ROOM */
                      <div className="space-y-3">
                        <div className="p-4 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block font-mono">CÓDIGO DE LA SALA</span>
                            <span className="text-xl font-mono font-black text-emerald-400 tracking-widest">{roomState.code}</span>
                          </div>
                          <button
                            onClick={copyRoomCode}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? '¡COPIADO!' : 'COPIAR PIN'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10">
                            <div className="text-[10px] text-neutral-400 font-mono">PILOTO 1 (HOST)</div>
                            <div className="text-sm font-black text-white truncate mt-1">{roomState.players.p1?.name || 'Anfitrión'}</div>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {roomState.players.p1?.isReady ? 'LISTO' : 'PREPARANDO'}
                            </span>
                          </div>
                          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10">
                            <div className="text-[10px] text-neutral-400 font-mono">PILOTO 2 (RIVAL)</div>
                            <div className="text-sm font-black text-white truncate mt-1">{roomState.players.p2?.name || 'Esperando...'}</div>
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              roomState.players.p2?.isReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-neutral-400 border-white/10'
                            }`}>
                              {roomState.players.p2 ? (roomState.players.p2.isReady ? 'LISTO' : 'PREPARANDO') : 'EN ESPERA'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            onClick={handleToggleReady}
                            className={`flex-1 py-3 rounded-2xl border text-xs font-black tracking-widest uppercase transition-all cursor-pointer font-mono ${
                              isReady
                                ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg'
                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {isReady ? '✓ LISTO PARA CORRER' : 'MARCAR COMO LISTO'}
                          </button>
                          <button
                            onClick={onLeaveRoom}
                            className="px-4 py-3 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/40 text-xs font-bold transition-all cursor-pointer"
                          >
                            SALIR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------- GRAN PREMIO EXCLUSIVE -------------------- */}
                {activeScreen === 'grand_prix' && (
                  <>
                    {/* Race Laps */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 font-mono">
                          <Activity className="w-4 h-4 text-red-400" />
                          VUELTAS DE GRAN PREMIO
                        </span>
                        <span className="text-[11px] font-mono text-red-400 font-bold">
                          Tiempo estimado: {calculateEstimatedTime(laps)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 font-mono">
                        {[
                          { val: 9 as RaceLapOption, label: '9 VUELTAS', sub: 'Sprint Rápido' },
                          { val: 20 as RaceLapOption, label: '20 VUELTAS', sub: 'GP Estándar' },
                          { val: 50 as RaceLapOption, label: '50 VUELTAS', sub: 'Resistencia Completa' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => {
                              playUiClick(700);
                              setLaps(item.val);
                            }}
                            onMouseEnter={playUiHover}
                            className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              laps === item.val
                                ? 'bg-red-600/25 border-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-black">{item.label}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Difficulty */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 mb-3 font-mono">
                        <Zap className="w-4 h-4 text-red-400" />
                        NIVEL DE RIVALES (IA)
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'easy' as RaceDifficulty, name: 'NOVATO', desc: 'Ritmo accesible' },
                          { id: 'medium' as RaceDifficulty, name: 'INTERMEDIO', desc: 'Competitivo parejo' },
                          { id: 'hard' as RaceDifficulty, name: 'LEYENDA FIA', desc: 'Máxima agresividad' },
                        ].map((diff) => (
                          <button
                            key={diff.id}
                            onClick={() => {
                              playUiClick(700);
                              setDifficulty(diff.id);
                            }}
                            onMouseEnter={playUiHover}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              difficulty === diff.id
                                ? 'bg-red-600/25 border-red-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-black">{diff.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{diff.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 3. TIRE STRATEGY CAPSULES (FOR ALL RACE MODES) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/15 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 font-mono">
                      <Flame className="w-4 h-4 text-red-400" />
                      COMPUESTO DE NEUMÁTICOS FIA
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Garantiza tracción y desgaste
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'soft' as TireCompoundType,
                        name: 'BLANDO C4',
                        desc: 'Agarre 100% · 8-10 Vueltas',
                        color: 'bg-red-600',
                        badge: 'ROJO',
                      },
                      {
                        id: 'medium' as TireCompoundType,
                        name: 'MEDIO C3',
                        desc: 'Agarre 92% · 18-22 Vueltas',
                        color: 'bg-yellow-500',
                        badge: 'AMARILLO',
                      },
                      {
                        id: 'hard' as TireCompoundType,
                        name: 'DURO C2',
                        desc: 'Agarre 84% · 35+ Vueltas',
                        color: 'bg-neutral-100',
                        badge: 'BLANCO',
                      },
                    ].map((tire) => {
                      const isSelected = startingCompound === tire.id;
                      return (
                        <button
                          key={tire.id}
                          onClick={() => {
                            playUiClick(750);
                            setStartingCompound(tire.id);
                          }}
                          onMouseEnter={playUiHover}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white/15 border-white text-white shadow-lg'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full ${tire.color} shadow-sm shrink-0`} />
                              <span className="text-xs font-black">{tire.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-2 font-mono">{tire.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. MASTER LAUNCH CTA BUTTON (GT7 CARBON ESPEC) */}
                <div className="pt-2">
                  {activeScreen === 'career' && (
                    <button
                      onClick={handleLaunchCareer}
                      onMouseEnter={playUiHover}
                      className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(245,158,11,0.45)] flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span>INICIAR GRAN PREMIO DE TEMPORADA</span>
                    </button>
                  )}

                  {activeScreen === 'free' && (
                    <button
                      onClick={handleLaunchFreePractice}
                      onMouseEnter={playUiHover}
                      className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(6,182,212,0.45)] flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span>SALTAR A LA PISTA (PRÁCTICA LIBRE)</span>
                    </button>
                  )}

                  {activeScreen === 'multiplayer' && (
                    <>
                      {!roomState ? (
                        mpTab === 'create' ? (
                          <button
                            onClick={handleCreateRoomAction}
                            disabled={isConnecting}
                            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.45)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
                          >
                            <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                            <span>{isConnecting ? 'CONECTANDO AL PADDOCK...' : 'CREAR SALA Y ESPERAR RIVAL'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleJoinRoomAction}
                            disabled={isConnecting || !joinCodeInput.trim()}
                            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.45)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
                          >
                            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>{isConnecting ? 'CONECTANDO...' : 'UNIRSE AL DUELO 1V1'}</span>
                          </button>
                        )
                      ) : (
                        playerId === 'p1' && (
                          <button
                            onClick={() => {
                              playUiClick(950);
                              onStartMultiplayerRace();
                            }}
                            disabled={!roomState.players.p1?.isReady || !roomState.players.p2?.isReady}
                            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 cursor-pointer group"
                          >
                            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                            <span>INICIAR DUELO 1V1 (AMBOS LISTOS)</span>
                          </button>
                        )
                      )}
                    </>
                  )}

                  {activeScreen === 'grand_prix' && (
                    <button
                      onClick={handleLaunchGrandPrix}
                      onMouseEnter={playUiHover}
                      className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span>INICIAR GRAN PREMIO (5 MONOPLAZAS FIA)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. GT7 EDITORIAL FOOTER                                                   */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-neutral-950/70 backdrop-blur-md px-4 sm:px-8 py-2.5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-neutral-300">APEX GT FORMULA RACING ENGINE</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline text-neutral-400">Three.js WebGL2 Dynamic Physics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-300">60 / 120 FPS HIGH FIDELITY</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 4. CONTROLS GUIDE MODAL                                                   */}
      {/* ========================================================================= */}
      {showControlsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">GUÍA DE CONTROLES</h3>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setShowControlsModal(false);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Acelerar / Freno</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">W / S o Flechas ↑ / ↓</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Girar Dirección</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">A / D o Flechas ← / →</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Freno de Mano / Derrape</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">Espacio (Space)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Cambiar Cámara</span>
                <span className="font-mono text-cyan-400 bg-white/10 px-2 py-0.5 rounded">Tecla C</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Pausa / Menú de Carrera</span>
                <span className="font-mono text-red-400 bg-white/10 px-2 py-0.5 rounded">Escape (ESC)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Pantalla Completa</span>
                <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">Tecla F</span>
              </div>
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setShowControlsModal(false);
              }}
              className="w-full mt-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
