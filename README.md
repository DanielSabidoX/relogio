# Relógio Desktop — Electron

Relógio digital para Windows inspirado em displays de 7 segmentos.

## Requisitos

- Windows 10/11
- Node.js instalado

## Executar durante o desenvolvimento

Abra o terminal dentro desta pasta:

```bash
npm install
npm start
```

## Gerar o EXE

```bash
npm run dist
```

Os arquivos serão criados na pasta `dist`.

Serão gerados:
- instalador Windows NSIS
- versão portátil `.exe`

## Recursos

- Relógio digital em 7 segmentos
- 12h/24h
- Dia da semana
- Data
- Temperatura por geolocalização
- Janela sem moldura tradicional
- Arrastar pela barra superior
- Sempre no topo
- Minimizar
- Fechar
- Visual escuro inspirado no relógio da imagem

## Observação sobre temperatura

A temperatura utiliza a API pública Open-Meteo e a localização fornecida pelo navegador/Windows. É necessária conexão com a internet para atualizar a temperatura.
