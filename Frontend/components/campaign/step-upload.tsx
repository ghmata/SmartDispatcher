"use client";

import React from "react"

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, Check } from "lucide-react";

interface StepUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  previewData: string[][];
  onPreviewChange: (data: string[][]) => void;
}

export function StepUpload({
  file,
  onFileChange,
  previewData,
  onPreviewChange,
}: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.slice(0, 6).map((line) =>
      line.split(/[,;]/).map((cell) => cell.trim().replace(/"/g, ""))
    );
  };

  const handleFile = useCallback(
    async (selectedFile: File) => {
      if (
        !selectedFile.name.endsWith(".csv") &&
        !selectedFile.name.endsWith(".xlsx")
      ) {
        alert("Por favor, selecione um arquivo .csv ou .xlsx");
        return;
      }

      onFileChange(selectedFile);

      // Parse CSV for preview
      if (selectedFile.name.endsWith(".csv")) {
        const text = await selectedFile.text();
        const parsed = parseCSV(text);
        onPreviewChange(parsed);
      } else {
        // Mock preview for xlsx
        onPreviewChange([
          ["Nome", "Telefone", "Email"],
          ["João Silva", "5511999999999", "joao@email.com"],
          ["Maria Santos", "5521988888888", "maria@email.com"],
          ["Pedro Costa", "5531977777777", "pedro@email.com"],
          ["Ana Oliveira", "5541966666666", "ana@email.com"],
        ]);
      }
    },
    [onFileChange, onPreviewChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    onPreviewChange([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Upload de Leads
        </h3>
        <p className="text-sm text-muted-foreground">
          Importe sua lista de contatos em formato CSV ou XLSX
        </p>
      </div>

      {!file ? (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="text-foreground font-medium mb-1">
              Arraste e solte seu arquivo aqui
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar
            </p>
            <label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span className="cursor-pointer">Selecionar Arquivo</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos aceitos: .csv, .xlsx
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <FileSpreadsheet className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {previewData.length > 0 && (
            <Card className="border-border bg-card/50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Preview (primeiras {previewData.length - 1} linhas)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {previewData[0]?.map((header, i) => (
                          <th
                            key={i}
                            className="px-3 py-2 text-left text-muted-foreground font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-border/50 last:border-0"
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-2 text-foreground"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
