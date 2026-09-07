sed -i '' 's/setIsDrawing(!isDrawing);/if (!isDrawing) setDrawnBoundary(prev => [...prev, []]); setIsDrawing(!isDrawing);/g' src/app/[locale]/fields/page.tsx
