# Available Skills

This directory contains specialized skills for different parts of the chIoT Platform codebase.

## Skills

| Skill | File | Description |
|-------|------|-------------|
| `backend-dev` | `.skills/backend-dev.md` | Express/TypeScript backend development |
| `frontend-dev` | `.skills/frontend-dev.md` | Next.js/React frontend development |
| `mobile-dev` | `.skills/mobile-dev.md` | React Native mobile app development |
| `firmware-dev` | `.skills/firmware-dev.md` | ESP32/PlatformIO firmware development |

## Usage

Agents should use the `/skill` command to load the appropriate skill based on the task:

```
/skill backend-dev    # For backend API, Mongoose, MQTT work
/skill frontend-dev   # For Next.js, React, Tailwind work
/skill mobile-dev     # For React Native, BLE, mobile work
/skill firmware-dev   # For ESP32, BLE provisioning, MQTT work
```

Each skill contains:
- Tech stack overview
- Key commands for building, testing, and linting
- Code patterns and templates
- Naming conventions
- File structure guidelines
- Testing patterns
- When to use the skill
