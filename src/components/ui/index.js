/**
 * UI Component Registry
 *
 * Components are grouped by category and include bundle size hints:
 * - Small (<5KB): Basic components with minimal dependencies
 * - Medium (5-15KB): Components with moderate complexity
 * - Large (>15KB): Complex components with heavy dependencies
 */

// ============================================================================
// BASIC COMPONENTS (Small bundle size)
// ============================================================================

// Typography & Layout
export { Badge } from "./badge";
export { Label } from "./label";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";

// Form Inputs
export { Button } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Checkbox } from "./checkbox";
export { Switch } from "./switch";
export { Slider } from "./slider";
export { RadioGroup } from "./radio-group";

// Display Components
export { Avatar } from "./avatar";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export { Progress } from "./progress";
export { AspectRatio } from "./aspect-ratio";

// ============================================================================
// INTERACTIVE COMPONENTS (Medium bundle size)
// ============================================================================

// Navigation
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./breadcrumb";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle } from "./navigation-menu";

// Overlays & Dialogs
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
export { Popover, PopoverTrigger, PopoverContent } from "./popover";
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog";
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./sheet";
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";

// Menus & Dropdowns
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./dropdown-menu";
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./context-menu";
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarPortal, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarSub, MenubarShortcut } from "./menubar";

// Form Components
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./select";
export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "./form";
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./input-otp";

// Content Display
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";

// ============================================================================
// ADVANCED COMPONENTS (Large bundle size - use sparingly)
// ============================================================================

// Complex Interactions
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./drawer";
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./carousel";
export { Calendar } from "./calendar";
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "./command";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./pagination";

// Layout Components
export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";
export { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuBadge, SidebarSeparator, SidebarRail } from "./sidebar";

// Data Visualization
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "./chart";

// Notifications
export { Toaster } from "./sonner";
