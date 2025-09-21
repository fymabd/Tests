# Overview

This is a Discord bot for managing virtual shops in Arabic Discord servers. The bot provides a comprehensive shop management system where users can create, manage, and interact with virtual stores within Discord channels. It includes features for shop creation, mention management, warning systems, helper assignments, and automated shop administration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Architecture
- **Main Entry Point**: `shop-bot.js` - Central bot file handling Discord client initialization and event management
- **Command Structure**: Modular command system organized in `/commands` directory with subdirectories for different command categories
- **Database Layer**: Uses QuickDB with JSON file storage (`quickdb.json`) for persistent data storage
- **Configuration Management**: Centralized configuration in `config` object with bot tokens, channel IDs, role IDs, and other settings

## Command Organization
- **Admin Commands** (`/commands/admin/`): Shop management, warnings, activation/deactivation, mention management
- **Shop Commands** (`/commands/shop/`): Shop creation, helper management
- **User Commands** (`/commands/user/`): Mention viewing and interaction
- **Utility Commands** (`/commands/utility/`): Tax calculation, shop data display, ticket system

## Shop Management System
- **Shop Types**: Five tiers (PLATINUM, GRAND MASTER, MASTER, DIAMOND, BRONZE) with different permissions and mention limits
- **Permission System**: Role-based access control with different shop tiers having varying privileges
- **Mention System**: Tracks and limits @everyone, @here, and shop mentions per store
- **Warning System**: Automated warning tracking with escalating consequences (disable at 5 warnings, delete at 7)

## Data Storage Architecture
- **Shop Data Structure**: Stores owner ID, shop type, mention counts, creation date, status, warnings, and helper information
- **Persistent Storage**: JSON-based database using QuickDB for reliable data persistence
- **Key-Value Storage**: Shop data indexed by channel ID with structured object storage

## User Interface Components
- **Discord Slash Commands**: Modern Discord application commands for all interactions
- **Interactive Buttons**: Action buttons for shop management and mention purchasing
- **Modal Forms**: For collecting detailed user input
- **Embed Messages**: Rich embed formatting for professional message presentation

# External Dependencies

## Core Discord Integration
- **discord.js v14**: Primary Discord API wrapper for bot functionality
- **Discord Application Commands**: Slash command system for user interactions
- **Discord Permissions System**: Channel and role permission management

## Database and Storage
- **quick.db**: Lightweight JSON-based database for persistent data storage
- **write-file-atomic**: Atomic file writing for data integrity

## Utility Libraries
- **ms**: Time parsing and formatting for duration-based features
- **express**: Web server framework (minimal usage)
- **canvas**: Image manipulation capabilities
- **node-fetch**: HTTP requests for external API calls

## Optional Services
- **Prodia**: AI image generation service integration
- **ProBot Integration**: Support for ProBot economy system integration

## Development Tools
- **@types/node**: TypeScript definitions for Node.js
- **nodemon**: Development server with auto-restart capability