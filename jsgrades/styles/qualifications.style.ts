// Qualification/Node Summary Page Styles
export const summaryPageContainerClass = 'min-h-screen w-full pb-8';
export const summaryPageBackdropClass = 'absolute inset-0 top-12 bg-background/80 backdrop-blur-sm';
export const summaryPageContentClass = 'relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8';

// Header Styles
export const summaryHeaderClass = 'mb-6 flex items-center justify-between gap-4 align-middle';
export const summaryHeaderTitleWrapperClass = 'mb-1 flex items-center gap-3';
export const summaryHeaderTitleClass = 'text-3xl font-bold tracking-tight';
export const summaryHeaderSubtitleClass = 'text-muted-foreground';
export const summaryHeaderActionsClass = 'flex gap-2';

// Stats Grid Styles
export const summaryStatsGridClass = 'mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';
export const summaryStatCardHeaderClass = 'flex flex-row items-center justify-between space-y-0 pb-1';
export const summaryStatCardTitleClass = 'text-sm font-medium';
export const summaryStatCardIconClass = 'h-4 w-4 text-muted-foreground';
export const summaryStatCardValueClass = 'text-2xl font-bold';

// List Styles
export const summaryListBorderClass = 'rounded-md border';
export const summaryListClass = 'divide-y divide-border';
export const summaryListItemClass = 'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const summaryListItemContentClass = 'min-w-0';
export const summaryListItemTitleClass = 'truncate font-medium';
export const summaryListItemSubtitleClass = 'truncate text-sm text-muted-foreground';
export const summaryListItemMetaClass = 'ml-4 flex shrink-0 items-center gap-3';
export const summaryListItemMetaLabelClass = 'hidden text-xs text-muted-foreground sm:inline';
export const summaryListItemMetaValueClass = 'text-sm font-medium';
export const summaryListItemMetaHighlightClass = 'text-primary';
export const summaryListItemIconClass = 'h-4 w-4 text-muted-foreground';

// Empty State Styles
export const summaryEmptyStateClass = 'py-8 text-center';
export const summaryEmptyStateIconClass = 'mx-auto mb-4 h-12 w-12 text-muted-foreground';
export const summaryEmptyStateTitleClass = 'text-lg font-medium';
export const summaryEmptyStateDescClass = 'text-sm text-muted-foreground';

// Status Badge Styles
export const statusBadgeBaseClass = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';
export const statusBadgeCompletedClass = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
export const statusBadgeInProgressClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
export const statusBadgeIconClass = 'mr-1.5 h-3 w-3';