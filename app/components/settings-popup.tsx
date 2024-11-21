import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from 'lucide-react'

interface SettingsPopupProps {
  settings: {
    fontSize: number;
    fontColor: string;
    fontType: string;
    cursorStyle: string;
    readingMode: boolean;
    ignoreCapitalization: boolean;
    skipPunctuation: boolean;
    stopCursorAfterMistake: boolean;
  };
  setSettings: React.Dispatch<React.SetStateAction<SettingsPopupProps['settings']>>;
}

export function SettingsPopup({ settings, setSettings }: SettingsPopupProps) {
  const handleChange = (key: keyof SettingsPopupProps['settings'], value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fontSize" className="text-right">
              Font Size
            </Label>
            <Input
              id="fontSize"
              type="number"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fontColor" className="text-right">
              Font Color
            </Label>
            <Input
              id="fontColor"
              type="color"
              value={settings.fontColor}
              onChange={(e) => handleChange('fontColor', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fontType" className="text-right">
              Font Type
            </Label>
            <Select
              value={settings.fontType}
              onValueChange={(value) => handleChange('fontType', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select font type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cursorStyle" className="text-right">
              Cursor Style
            </Label>
            <Select
              value={settings.cursorStyle}
              onValueChange={(value) => handleChange('cursorStyle', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select cursor style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="readingMode"
              checked={settings.readingMode}
              onCheckedChange={(checked) => handleChange('readingMode', checked)}
            />
            <Label htmlFor="readingMode">Reading Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ignoreCapitalization"
              checked={settings.ignoreCapitalization}
              onCheckedChange={(checked) => handleChange('ignoreCapitalization', checked)}
            />
            <Label htmlFor="ignoreCapitalization">Ignore Capitalization</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="skipPunctuation"
              checked={settings.skipPunctuation}
              onCheckedChange={(checked) => handleChange('skipPunctuation', checked)}
            />
            <Label htmlFor="skipPunctuation">Skip Punctuation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="stopCursorAfterMistake"
              checked={settings.stopCursorAfterMistake}
              onCheckedChange={(checked) => handleChange('stopCursorAfterMistake', checked)}
            />
            <Label htmlFor="stopCursorAfterMistake">Stop Cursor After Mistake</Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

