"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PDFUploader({ setCurrentPDF }: { setCurrentPDF: (pdf: string) => void }) {
  const [pdfs, setPDFs] = useState<string[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you'd upload the file to a server here
      const newPDF = file.name
      setPDFs([...pdfs, newPDF])
      setCurrentPDF(newPDF)
    }
  }

  return (
    <div className="space-y-4">
      <Input type="file" accept=".pdf" onChange={handleFileUpload} />
      <ul className="space-y-2">
        {pdfs.map((pdf, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{pdf}</span>
            <Button onClick={() => setCurrentPDF(pdf)}>Select</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

