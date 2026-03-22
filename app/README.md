# React Native chiot platform App

Aplicación móvil para el sistema IoT chiot platform.

## Requisitos

- Node.js 18+
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, macOS)

## Instalación

```bash
cd app
npm install
```

## Desarrollo

### Android
```bash
npm run android
```

### iOS
```bash
cd ios && pod install && cd ..
npm run ios
```

### Metro Bundler
```bash
npm start
```

## Estructura

```
app/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── screens/      # Pantallas
│   ├── hooks/        # Custom hooks
│   ├── services/     # API calls
│   ├── store/        # Zustand stores
│   └── types/        # TypeScript types
├── android/          # Proyecto Android
├── ios/              # Proyecto iOS
└── App.tsx           # Entry point
```

## API

La app se conecta al backend en `http://localhost:8080`. Para producción, cambiar la URL en `src/services/api.ts`.
