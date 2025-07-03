Project: ContentFlow - AI-Powered Content Creation Studio
Version: 1.0
Date: January 7, 2025
Author: ContentFlow Design System Team
1. Introduction
This document serves as the single source of truth for all UI components in the ContentFlow application, organized using atomic design methodology. This is a living document that defines every visual element from the smallest atom to complete page layouts. Following this system ensures absolute consistency across the entire application and enables rapid, predictable development.
2. Design Token Foundation
Before defining any components, we establish the primitive values that will be used throughout the system. These tokens are the "periodic table" of the ContentFlow design system.
2.1 Colors

Base Colors:
Token NameValueUsage GuidelinesPrimaryprimary-500#0066FFPrimary actions, active statesprimary-600#0052CCHover states for primaryprimary-400#3385FFFocus outlines, glowsprimary-100#E6F0FFLight backgroundsSecondarysecondary-500#6B46C1Secondary actions, accentssecondary-600#553C9AHover states for secondarysecondary-400#8B5CF6Light purple accentssecondary-100#F3F0FFLight purple backgroundsSemanticsuccess-500#10B981Success states, confirmationswarning-500#F59E0BWarnings, caution stateserror-500#EF4444Errors, destructive actionsinfo-500#3B82F6Informational messagesNeutralgray-900#111827Primary textgray-700#374151Secondary textgray-500#6B7280Placeholder textgray-300#D1D5DBBorders, dividersgray-100#F3F4F6Backgroundsgray-50#F9FAFBLight backgroundswhite#FFFFFFCards, overlaysblack#000000Pure black (rarely used)

Dark Mode Colors:
Token NameValueUsage Guidelinesdark-bg-primary#0d0e14Main background (deepest)dark-bg-secondary#1a1b26Content backgroundsdark-bg-elevated#242530Elevated surfaces, cardsdark-bg-hover#2a2b38Hover states on dark bgdark-border-primary#2a2b38Primary bordersdark-border-secondary#1f2029Subtle bordersdark-text-primary#e4e6ebPrimary text on darkdark-text-secondary#a8b2d1Secondary text on darkdark-text-tertiary#64748bTertiary/muted text

Glass Effects:
Token NameValueUsage Guidelinesglass-lightbackdrop-filter: blur(10px); background: rgba(255,255,255,0.1)Light glassmorphismglass-darkbackdrop-filter: blur(20px); background: rgba(0,0,0,0.2)Dark glassmorphismglass-ultrabackdrop-filter: blur(40px); background: rgba(13,14,20,0.7)Heavy glassmorphismglass-border1px solid rgba(255,255,255,0.1)Glass element bordersglass-border-hover1px solid rgba(255,255,255,0.2)Glass hover borders

Gradients:
Token NameValueUsage Guidelinesgradient-primarylinear-gradient(135deg, #6B46C1 0%, #0066FF 100%)Primary gradient accentsgradient-darkradial-gradient(circle at 20% 50%, #6B46C1 0%, transparent 50%)Background accentsgradient-surfacelinear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)Surface shinesgradient-glowradial-gradient(circle at 50% 50%, rgba(107,70,193,0.4) 0%, transparent 70%)Glow effectsgradient-meshbackground-image: radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%)Mesh gradients
2.2 Typography
Token NameFont FamilySizeWeightLine HeightLetter SpacingFont Familiesfont-sansInter, -apple-system, BlinkMacSystemFont, sans-serif----font-monoSF Mono, Monaco, monospace----Type Scaletext-xsfont-sans12px40016px0text-smfont-sans14px40020px0text-basefont-sans16px40024px0text-lgfont-sans18px40028px0text-xlfont-sans20px40030px0text-2xlfont-sans24px60032px-0.02emtext-3xlfont-sans30px60038px-0.02emtext-4xlfont-sans36px70044px-0.02emFont Weightsfont-normal--400--font-medium--500--font-semibold--600--font-bold--700--

Text Effects:
Token NameValueUsage Guidelinestext-gradientbackground: linear-gradient(135deg, #e4e6eb 0%, #a8b2d1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparentGradient text effectstext-glowtext-shadow: 0 0 20px rgba(255,255,255,0.5)Glowing text effecttext-glow-purpletext-shadow: 0 0 30px rgba(107,70,193,0.6)Purple glow effecttext-shadow-subtletext-shadow: 0 2px 4px rgba(0,0,0,0.1)Subtle depth
2.3 Spacing
Base unit: 4px. All spacing uses multiples of this base unit.
Token NameValueUsagespace-00pxNo spacingspace-14pxTight spacingspace-28pxInner paddingspace-312pxStandard paddingspace-416pxSection paddingspace-520pxLarge paddingspace-624pxExtra paddingspace-832pxSection spacingspace-1040pxLarge spacingspace-1248pxExtra large spacingspace-1664pxPage margins
2.4 Borders
Token NameValueUsageRadiusrounded-none0pxSharp cornersrounded-sm4pxSubtle roundingrounded8pxStandard roundingrounded-md12pxMedium roundingrounded-lg16pxLarge cardsrounded-full9999pxPills, avatarsWidthborder-00pxNo borderborder1pxStandard borderborder-22pxEmphasis borderborder-44pxHeavy border
2.5 Shadows
Token NameValueUsageshadow-sm0 1px 2px rgba(0,0,0,0.05)Subtle elevationshadow0 4px 6px rgba(0,0,0,0.1)Standard elevationshadow-md0 8px 16px rgba(0,0,0,0.15)Modals, dropdownsshadow-lg0 16px 32px rgba(0,0,0,0.2)High elevationshadow-xl0 24px 48px rgba(0,0,0,0.25)Maximum elevationshadow-glow0 0 40px rgba(107,70,193,0.3)Purple glow effectshadow-glow-intense0 0 60px rgba(107,70,193,0.5)Intense purple glowshadow-glow-blue0 0 40px rgba(0,102,255,0.3)Blue glow effectshadow-inner-subtleinset 0 2px 4px rgba(0,0,0,0.06)Subtle inner shadowshadow-innerinset 0 2px 4px rgba(0,0,0,0.2)Inner shadowshadow-spread0 25px 50px -12px rgba(0,0,0,0.5)Dramatic spreadshadow-glass0 8px 32px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.1)Glass effect shadow
2.6 Animation
Token NameValueUsageDurationduration-instant75msInstant feedbackduration-fast150msMicro-interactionsduration-normal300msStandard transitionsduration-slow500msComplex animationsduration-xl700msElaborate animationsEasingease-in-outcubic-bezier(0.4, 0, 0.2, 1)Standard easingease-outcubic-bezier(0, 0, 0.2, 1)Exit animationsease-incubic-bezier(0.4, 0, 1, 1)Enter animationsease-spring cubic-bezier(0.34, 1.56, 0.64, 1)Spring/bounce effectsease-smoothcubic-bezier(0.4, 0, 0.6, 1)Smooth transitionsTransformstransform-hoverscale(1.02) translateY(-2px)Hover lift effecttransform-pressscale(0.98)Press/click effecttransform-float translateY(-4px)Floating effectAnimation Presetsanimate-pulsepulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinitePulsing effectanimate-glow0 0 20px rgba(107,70,193,0.5)Glowing animationanimate-float float 3s ease-in-out infiniteFloating animation
2.7 Breakpoints
Token NameValueUsagescreen-sm640pxSmall screensscreen-md768pxMedium screensscreen-lg1024pxLarge screensscreen-xl1280pxExtra large screens
2.8 Z-Index
Token NameValueUsagez-00Base layerz-1010Floating elementsz-2020Dropdownsz-3030Fixed headersz-4040Modalsz-5050Notifications
3. Component Hierarchy Structure
3.1 Atoms Definition
The indivisible UI elements that serve as building blocks:
Form Elements:

Input, Textarea, Select, Checkbox, Radio, Toggle, Slider

Buttons:

Primary, Secondary, Tertiary, Icon, Ghost, Destructive

Typography:

Heading (H1-H6), Paragraph, Label, Caption, Code

Media:

Image, Icon, Avatar, Logo

Feedback:

Badge, Tag, Tooltip, ProgressBar, Spinner

Layout:

Divider, Spacer, Container

3.2 Molecules Definition
Simple combinations of atoms that work as units:

FormField: Label + Input + HelperText/ErrorText
SearchBar: Icon + Input + ClearButton
FileItem: Icon + FileName + FileSize + Status
NotificationToast: Icon + Message + CloseButton
ButtonGroup: Multiple related buttons
StatCard: Label + Value + TrendIndicator
DropZone: Icon + Text + DashedBorder

3.3 Organisms Definition
Complex, reusable UI sections:

Navigation: Sidebar with logo, nav items, user menu
FileList: Scrollable list of FileItems with actions
TranscriptCard: Preview, metadata, tags, actions
ContentEditor: Template selector, editor, preview
ProgressModal: Multi-step progress with messages
SettingsPanel: Grouped form fields with sections

3.4 Templates Definition
Page-level layout patterns:

SidebarLayout: Fixed sidebar + scrollable main content
SplitView: Resizable panels for list/detail views
FullScreenWizard: Step indicator + content + actions
DashboardGrid: Responsive grid for cards and widgets

3.5 Pages Definition
Actual pages using templates with real content:

FileManager: File import and organization
TranscriptLibrary: Search and browse transcripts
ContentStudio: Create and edit content
Settings: Configure integrations and preferences

4. Component Specification Format
4.1 Button Atom
Component Properties Table:
Property NameTypeRequiredDefault ValueOptionsDescriptionvariantstringNoprimaryprimary, secondary, tertiary, ghost, destructiveVisual style variantsizestringNomediumsmall, medium, largeButton sizedisabledbooleanNofalsetrue, falseDisabled stateloadingbooleanNofalsetrue, falseShows loading spinnerfullWidthbooleanNofalsetrue, falseSpans full container widthiconReactNodeNonullAny Icon componentIcon to displayonClickfunctionNo-FunctionClick handlerchildrenReactNodeYes-AnyButton content
Visual States Documentation:
Primary Button States:

Light Mode:
Default: Background: primary-500, Text: white, Border: none
Hover: Background: primary-600, Transform: translateY(-1px), Shadow: shadow-md
Focus: Outline: 3px solid primary-400, Outline-offset: 2px
Active: Background: primary-700, Transform: translateY(0)
Disabled: Background: gray-300, Text: gray-500, Cursor: not-allowed
Loading: Background: primary-500, Spinner: white, Text: hidden

Dark Mode:
Default: Background: gradient-primary, Text: white, Shadow: shadow-glow
Hover: Transform: transform-hover, Shadow: shadow-glow-intense
Focus: Outline: 3px solid secondary-400, Shadow: shadow-glow-intense
Active: Transform: scale(0.98), Shadow: shadow-glow
Disabled: Background: dark-bg-elevated, Text: dark-text-tertiary, Opacity: 0.5
Loading: Background: gradient-primary, Spinner: white, Animation: animate-pulse

Size Variations:

Small: Height: 32px, Padding: 8px 12px, Font: text-sm
Medium: Height: 40px, Padding: 10px 16px, Font: text-base
Large: Height: 48px, Padding: 12px 24px, Font: text-lg

Responsive Behavior:

On touch devices: Increase tap target to minimum 44px
On hover-capable devices: Show hover state
Focus visible only on keyboard navigation

4.2 Input Atom
Component Properties Table:
Property NameTypeRequiredDefault ValueOptionsDescriptiontypestringNotexttext, email, password, number, searchInput typeplaceholderstringNo-Any stringPlaceholder textvaluestringYes-Any stringCurrent valueonChangefunctionYes-FunctionChange handlerdisabledbooleanNofalsetrue, falseDisabled stateerrorbooleanNofalsetrue, falseError stateiconReactNodeNonullAny IconLeading iconmaxLengthnumberNo-Any numberCharacter limit
Visual States Documentation:

Default: Border: gray-300, Background: white, Text: gray-900
Hover: Border: gray-400
Focus: Border: primary-500, Shadow: 0 0 0 3px primary-100
Disabled: Background: gray-50, Text: gray-500, Cursor: not-allowed
Error: Border: error-500, Shadow: 0 0 0 3px error-100
With Icon: Padding-left: 40px, Icon color: gray-500

4.3 FileItem Molecule
Composition:
typescriptFileItem = Icon + Text + Badge + IconButton
Component Properties Table:
Property NameTypeRequiredDefault ValueDescriptionfileFileObjectYes-File data objectselectedbooleanNofalseSelection stateonSelectfunctionNo-Selection handleronActionfunctionNo-Action menu handler
Visual States Documentation:

Default: Background: white, Border: 1px solid gray-200
Hover: Background: gray-50, Border: gray-300
Selected: Background: primary-50, Border: primary-500
Processing: Opacity: 0.7, Loading spinner visible

5. Composition Rules
5.1 Valid Compositions

Buttons can contain Icons but not other Buttons
FormFields must contain exactly one Input/Select/Textarea
Cards can contain any atoms or molecules but not other Cards
Modals can contain any components except other Modals

5.2 Invalid Compositions

Never nest interactive elements (Button inside Button)
Never put Cards inside Cards
Never put multiple Inputs in a single FormField
Never use Headings inside Buttons or Labels

6. Naming Conventions
6.1 Component Names

Format: PascalCase for all components
Atoms: Simple nouns (Button, Input, Badge)
Molecules: Compound nouns (FormField, SearchBar)
Organisms: Descriptive compounds (TranscriptCard, ContentEditor)

6.2 Property Names

Boolean props: is/has/should prefix (isDisabled, hasError)
Event handlers: on prefix (onClick, onChange)
Style variants: variant, size, color properties

7. Implementation Rules
7.1 Style Application

Token Usage: ALL style values MUST use design tokens
No Magic Numbers: Never use arbitrary values
Responsive Units: Use rem for typography, pixels for borders
CSS Properties by Level:

Atoms: Can use all CSS properties
Molecules: Only layout properties (flex, grid, spacing)
Organisms: Only layout and positioning
Templates: Only layout properties



7.2 State Management

Atoms: Stateless, controlled by props only
Molecules: Can have UI state (open/closed)
Organisms: Can have complex state and side effects
Templates/Pages: Handle application state and routing

8. File Organization Structure
src/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── components/
│   ├── atoms/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.styles.ts
│   │       ├── Button.test.tsx
│   │       ├── Button.stories.tsx
│   │       └── index.ts
│   ├── molecules/
│   │   └── FormField/
│   ├── organisms/
│   │   └── TranscriptCard/
│   ├── templates/
│   │   └── SidebarLayout/
│   └── pages/
│       └── ContentStudio/
9. Documentation Requirements
Every component MUST include:

Component Description: Purpose and usage guidelines
Props Documentation: Complete table with types and defaults
Usage Examples: Minimum 3 examples showing variations
Do's and Don'ts: Best practices and anti-patterns
Accessibility Notes: ARIA labels, keyboard navigation
Related Components: Links to similar components

10. Premium Dark Theme Guidelines

Layout Principles:
✓ Increase negative space - Use space-10 or space-12 between major sections
✓ Glass effects on elevated surfaces - Cards use glass-dark with backdrop blur
✓ Gradient accents - Apply gradient-mesh to page backgrounds
✓ Depth through layering - Use dark-bg-primary → dark-bg-secondary → dark-bg-elevated
✓ Glow effects on interactive elements - Buttons and focus states use shadow-glow
✓ Smooth micro-animations - All transitions use duration-normal with ease-smooth

Premium Component Patterns:
✓ Cards: Glass background, subtle border, shadow-glass on hover
✓ Buttons: Gradient backgrounds, glow effects, transform on hover
✓ Inputs: Glass backgrounds, glow on focus, subtle inner shadows
✓ Modals: Heavy glass effect (glass-ultra), floating with shadow-spread
✓ Navigation: Semi-transparent with backdrop blur, gradient accents

11. Quality Checklist
Before any component is considered complete:

✓ Uses only design tokens for styling
✓ Has all required documentation
✓ Includes all defined visual states (light and dark)
✓ Passes accessibility audit (WCAG AA)
✓ Has responsive behavior defined
✓ Includes usage examples
✓ Follows naming conventions
✓ Has proper file structure
✓ Includes Storybook stories
✓ Has unit tests for logic
✓ Dark mode optimized with glass effects
✓ Includes micro-animations

11. Component Examples
DropZone Molecule Example
typescript// DropZone.tsx
interface DropZoneProps {
  onDrop: (files: File[]) => void;
  accept?: string[];
  maxSize?: number;
  disabled?: boolean;
}

// Visual states
const dropZoneStates = {
  default: {
    border: '2px dashed token(dark-border-primary)',
    background: 'token(glass-dark)',
    backdropFilter: 'blur(20px)',
    cursor: 'pointer'
  },
  dragOver: {
    border: '2px solid token(primary-500)',
    background: 'linear-gradient(135deg, rgba(107,70,193,0.1), rgba(0,102,255,0.1))',
    backdropFilter: 'blur(20px)',
    transform: 'scale(1.02)',
    boxShadow: 'token(shadow-glow)'
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: 'token(dark-bg-elevated)'
  },
  error: {
    border: '2px dashed token(error-500)',
    background: 'rgba(239,68,68,0.1)',
    backdropFilter: 'blur(20px)'
  }
};
TranscriptCard Organism Example
typescript// Composition
TranscriptCard = Card(
  Header(Title + Date + Duration),
  Body(TranscriptPreview + TagList),
  Footer(ActionButtons + ContentScore)
)

// States
- Default: White background, subtle shadow
- Hover: Elevated shadow, visible action buttons
- Selected: Primary border, selection checkbox visible
- Processing: Loading overlay with progress