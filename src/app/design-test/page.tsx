import { Button } from "@/components/ui/Button";

export default function DesignSystemTest() {
    return (
        <div className="p-10 space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Design System Check</h1>
                <p className="text-muted-foreground">Verifying colors, typography, and components.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div className="bg-background p-4 border rounded">Background / Foreground</div>
                <div className="bg-muted p-4 rounded text-muted-foreground">Muted / Muted Foreground</div>
                <div className="bg-card p-4 shadow rounded text-card-foreground">Card / Card Foreground</div>
                <div className="bg-primary p-4 rounded text-primary-foreground">Primary</div>
                <div className="bg-accent p-4 rounded text-accent-foreground">Accent (Emerald)</div>
                <div className="bg-destructive p-4 rounded text-destructive-foreground">Destructive (Red)</div>
                <div className="bg-warning p-4 rounded text-warning-foreground text-black">Warning (Amber)</div>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Button</Button>
            </div>
        </div>
    );
}
