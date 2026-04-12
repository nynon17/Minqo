# Minqo

A modern web application for designing a simple 3D room directly in the browser.  
The project focuses on intuitive room planning, adjusting room dimensions, choosing furniture, changing wall colors, and viewing the scene from multiple angles.

## Project Overview

Minqo is an interactive interior planning tool where users can:
- set room dimensions
- change wall colors
- choose furniture
- rotate the room view in 360 degrees
- switch between multiple camera modes
- view the interior clearly thanks to dynamic wall hiding based on camera angle

The interface is inspired by the Japandi style, so the overall look is clean, calm, elegant, and minimal.

## Main Features

### Room Configuration
- set room width
- set room length
- set room height

### Visual Customization
- change wall colors
- choose materials and styles
- preview changes in real time

### Furniture
- browse furniture categories
- add furniture to the room
- extend later with moving, rotating, and deleting furniture

### Camera Views
- perspective view
- side view
- top view

### 3D Preview
- rotate the room in 360 degrees
- dynamically hide one or two nearest walls depending on camera angle
- keep the interior visible without manually toggling walls

## Project Goal

The goal of this project is to build a clean and modern interior planner that combines:
- polished user interface
- simple interaction
- functional 3D preview
- a strong foundation for future expansion

This project can serve as:
- a portfolio project
- a base for a more advanced interior design application
- an experiment with React, React Three Fiber, and UI design

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### UI
- Tailwind CSS
- shadcn/ui
- Japandi-inspired design system

### 3D
- Three.js
- React Three Fiber
- @react-three/drei

## Suggested Project Structure

```bash
src/
  components/
    layout/
    ui/
    planner/
    scene/
  pages/
  hooks/
  lib/
  store/
  types/
  assets/
