import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReflectionTextInputProps {
  onTextChanged: (text: string) => void
  placeholder?: string
  maxLength?: number
}

/**
 * ReflectionTextInput Component
 * 
 * Textarea for reflection input with character count
 */
export function ReflectionTextInput({
  onTextChanged,
  placeholder = "What made today special? What are you grateful for? How are you feeling?",
  maxLength = 2000,
}: ReflectionTextInputProps) {
  const [text, setText] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= maxLength) {
      setText(newText)
      onTextChanged(newText)
    }
  }

  const characterCount = text.length
  const isNearLimit = characterCount > maxLength * 0.9

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="reflection-text">Your Reflection</Label>
        <span
          className={`text-xs ${
            isNearLimit ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {characterCount} / {maxLength}
        </span>
      </div>
      <Textarea
        id="reflection-text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[200px] resize-none"
      />
    </div>
  )
}

