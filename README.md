# GameFlow Support

Create a modern game e-commerce website that includes an integrated AI customer support assistant with human agent escalation.

The website should feel like a real online gaming marketplace where customers browse and purchase games while receiving instant AI-powered support through a floating chat widget.

The main purpose of this prototype is to demonstrate an AI customer service workflow:

 AI handles common customer questions

 AI provides product and order assistance

 Complex cases are escalated to a human support agent

 The human agent receives the conversation context so customers do not need to repeat their concerns

Build this as a polished portfolio-quality product demo.

Design Direction

Overall Style

Create a modern, clean, professional gaming e-commerce interface.

The design should feel similar to modern online stores and SaaS products:

 Clean layouts

 Strong visual hierarchy

 Professional spacing

 Rounded cards

 Soft shadows

 Clear typography

 Easy navigation

Color System (Important)

Follow these design rules strictly:

Theme

 Use light mode only

 Do not create a dark theme

 Do not use black-heavy interfaces

Colors

The design should NOT be grayscale-only.

Use:

Primary background:

 White

 Very light gray sections

Accent color:
Choose ONE primary brand color:

 Blue (#3B82F6)
OR

 Emerald (#10B981)
OR

 Orange (#F59E0B)

Use the accent color for:

 Primary buttons

 Call-to-action elements

 Chat widget button

 Active navigation states

 Important status indicators

Supporting colors:

 Soft neutral backgrounds

 Subtle borders

 Light status colors

Strict Restrictions:

 NEVER use gradients

 NEVER use color blending

 NEVER use neon gaming colors

 NEVER use excessive colors

 NEVER use dark mode styling

Use only solid colors and clean flat UI elements.

Application Structure

Create these main sections:

1. Customer-Facing Game Store

Homepage

Create a professional gaming storefront homepage.

Include:

Hero Section

 Large featured game promotion

 Game artwork

 Short marketing message

 Primary CTA button

Example:

"Discover Your Next Adventure"

Button:
"Browse Games"

Featured Games Section

Display game cards with:

 Cover image

 Game title

 Platform badge

 Price

 Rating

 Add to Cart button

Categories Section

Include categories:

 PC Games

 PlayStation

 Nintendo Switch

 Xbox

 Digital Downloads

2. Product Listing Page

Create a browsing experience.

Features:

 Search bar

 Category filtering

 Product grid

Each product card includes:

 Game cover

 Title

 Platform

 Price

 Availability

 View Details button

3. Product Detail Page

Include:

 Large game image

 Title

 Description

 Price

 Platform availability

 Product information

 Add to Cart button

Add related games section.

Sample Product Data

Use realistic mock game data:

Examples:

 Cyberpunk 2077

 Elden Ring

 The Legend of Zelda: Breath of the Wild

 Grand Theft Auto V

 Marvel's Spider-Man 2

Each product should have:

 Name

 Description

 Price

 Platform

 Category

 Stock status

AI Customer Support Widget

Placement

Add a floating chatbot button:

Location:

 Bottom-right corner of every customer-facing page

Behavior:

 Click opens chat panel

 Click again minimizes chat

The widget should visually match the website design.

Chat Interface

Create a modern customer support chat experience.

Include:

 AI avatar

 Message bubbles

 Timestamp

 Typing indicator

 Conversation history

 Quick action buttons

Initial greeting:

"Hi! I'm GameAssist AI. I can help you with games, orders, shipping, and returns."

AI Capabilities (Prototype)

Simulate AI responses using predefined logic.

The AI should answer questions about:

Products

Examples:

 "Is Elden Ring available?"

 "How much is Cyberpunk 2077?"

 "What platforms support this game?"

Orders

Examples:

 "Where is my order?"

 "Can I track my purchase?"

Policies

Examples:

 "What is your refund policy?"

 "How long does shipping take?"

Quick Reply Buttons

Show suggested actions:

 Track My Order

 Check Game Availability

 Refund Policy

 Shipping Information

 Talk to Human Agent

Human Agent Escalation System

This is the most important workflow.

Implement a realistic handoff experience.

Escalation Triggers

Move from AI to human agent when:

 Customer clicks:
"Talk to Human Agent"

 Customer types:

 agent

 human

 support representative

 AI cannot answer confidently

 Customer repeats the same question multiple times

Customer Handoff Experience

When escalation happens:

Display:

"Connecting you with a support specialist..."

Update status:

 AI Assistant

 Waiting for Agent

 Agent Joined

After agent joins:

 Stop AI responses

 Show agent messages instead

Agent Dashboard

Create a separate support dashboard page.

Purpose:
Allow support staff to manage escalated conversations.

Dashboard Layout

Include:

Conversation Sidebar

Display:

 Customer name

 Conversation status

 Time waiting

 Priority indicator

Example statuses:

 AI Handling

 Waiting for Agent

 Active Chat

 Resolved

Conversation View

Show:

 Customer messages

 AI responses

 Agent responses

AI Summary Panel

When a conversation is escalated, show:

Example:

"Customer is asking about a delayed game order. AI provided shipping information but customer requested human assistance."

Agent Reply Box

Allow agent to:

 Type responses

 Send messages

 Resolve conversation

Application States

Demonstrate these states:

State 1:

AI answering customer

State 2:

AI unable to answer

State 3:

Customer requests human support

State 4:

Waiting for agent

State 5:

Agent takes over conversation

Data Requirements

For this prototype:

Use mock data only.

Do not implement:

 Authentication

 Real payments

 Real order processing

 Real AI APIs

Structure components so these can be added later.

Technical Requirements

Build using Lovable's recommended frontend stack.

Prioritize:

 Reusable components

 Clean component organization

 Responsive design

 Mobile-friendly layout

Components should be separated logically:

Examples:

 Navbar

 ProductCard

 ProductGrid

 ChatWidget

 ChatMessage

 AgentDashboard

 ConversationPanel

 StatusBadge

Final Goal

The final result should look like a real startup MVP:

A gaming e-commerce platform enhanced with an AI customer support agent that seamlessly transitions to human support.

The focus should be:

 Excellent UI/UX

 Realistic customer workflow

 AI automation concept

 Human escalation experience

Do not create a simple chatbot demo. Create a complete e-commerce product experience with AI support integrated naturally.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/17bda9da-5c69-4f2b-a90f-0d093e335c67).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
