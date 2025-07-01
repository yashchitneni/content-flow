Project: ContentFlow - AI-Powered Content Creation Studio
Version: 1.0
Date: January 7, 2025
Author: ContentFlow Design System Team
1. Introduction
This document serves as the single source of truth for all UI components in the ContentFlow application, organized using atomic design methodology. This is a living document that defines every visual element from the smallest atom to complete page layouts. Following this system ensures absolute consistency across the entire application and enables rapid, predictable development.
2. Design Token Foundation
Before defining any components, we establish the primitive values that will be used throughout the system. These tokens are the "periodic table" of the ContentFlow design system.
2.1 Colors
Token NameValueUsage GuidelinesPrimaryprimary-500#0066FFPrimary actions, active statesprimary-600#0052CCHover states for primaryprimary-400#3385FFFocus outlinesprimary-100#E6F0FFLight backgroundsSecondarysecondary-500#6B46C1Secondary actions, accentssecondary-600#553C9AHover states for secondarysecondary-100#F3F0FFLight purple backgroundsSemanticsuccess-500#10B981Success states, confirmationswarning-500#F59E0BWarnings, caution stateserror-500#EF4444Errors, destructive actionsinfo-500#3B82F6Informational messagesNeutralgray-900#111827Primary textgray-700#374151Secondary textgray-500#6B7280Placeholder textgray-300#D1D5DBBorders, dividersgray-100#F3F4F6Backgroundsgray-50#F9FAFBLight backgroundswhite#FFFFFFCards, overlaysblack#000000Pure black (rarely used)
2.2 Typography
Token NameFont FamilySizeWeightLine HeightLetter SpacingFont Familiesfont-sansInter, -apple-system, BlinkMacSystemFont, sans-serif----font-monoSF Mono, Monaco, monospace----Type Scaletext-xsfont-sans12px40016px0text-smfont-sans14px40020px0text-basefont-sans16px40024px0text-lgfont-sans18px40028px0text-xlfont-sans20px40030px0text-2xlfont-sans24px60032px-0.02emtext-3xlfont-sans30px60038px-0.02emtext-4xlfont-sans36px70044px-0.02emFont Weightsfont-normal--400--font-medium--500--font-semibold--600--font-bold--700--
2.3 Spacing
Base unit: 4px. All spacing uses multiples of this base unit.
Token NameValueUsagespace-00pxNo spacingspace-14pxTight spacingspace-28pxInner paddingspace-312pxStandard paddingspace-416pxSection paddingspace-520pxLarge paddingspace-624pxExtra paddingspace-832pxSection spacingspace-1040pxLarge spacingspace-1248pxExtra large spacingspace-1664pxPage margins
2.4 Borders
Token NameValueUsageRadiusrounded-none0pxSharp cornersrounded-sm4pxSubtle roundingrounded8pxStandard roundingrounded-md12pxMedium roundingrounded-lg16pxLarge cardsrounded-full9999pxPills, avatarsWidthborder-00pxNo borderborder1pxStandard borderborder-22pxEmphasis borderborder-44pxHeavy border
2.5 Shadows
Token NameValueUsageshadow-sm0 1px 2px rgba(0,0,0,0.05)Subtle elevationshadow0 4px 6px rgba(0,0,0,0.1)Standard elevationshadow-md0 8px 16px rgba(0,0,0,0.15)Modals, dropdownsshadow-lg0 16px 32px rgba(0,0,0,0.2)High elevationshadow-xl0 24px 48px rgba(0,0,0,0.25)Maximum elevation
2.6 Animation
Token NameValueUsageDurationduration-fast150msMicro-interactionsduration-normal300msStandard transitionsduration-slow500msComplex animationsEasingease-in-outcubic-bezier(0.4, 0, 0.2, 1)Standard easingease-outcubic-bezier(0, 0, 0.2, 1)Exit animationsease-incubic-bezier(0.4, 0, 1, 1)Enter animations
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

Default: Background: primary-500, Text: white, Border: none
Hover: Background: primary-600, Transform: translateY(-1px)
Focus: Outline: 3px solid primary-400, Outline-offset: 2px
Active: Background: primary-700, Transform: translateY(0)
Disabled: Background: gray-300, Text: gray-500, Cursor: not-allowed
Loading: Background: primary-500, Spinner: white, Text: hidden

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

10. Quality Checklist
Before any component is considered complete:

✓ Uses only design tokens for styling
✓ Has all required documentation
✓ Includes all defined visual states
✓ Passes accessibility audit (WCAG AA)
✓ Has responsive behavior defined
✓ Includes usage examples
✓ Follows naming conventions
✓ Has proper file structure
✓ Includes Storybook stories
✓ Has unit tests for logic

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
    border: '2px dashed token(gray-300)',
    background: 'token(gray-50)',
    cursor: 'pointer'
  },
  dragOver: {
    border: '2px solid token(primary-500)',
    background: 'token(primary-50)',
    transform: 'scale(1.02)'
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  error: {
    border: '2px dashed token(error-500)',
    background: 'token(error-50)'
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