import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { MonthSummary } from '../types'
import { CATEGORIA_MAP } from '../types'
import { formatValor } from './dates'
import { valorEfetivo } from './valores'

const STATUS_LABEL: Record<string, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
}

function linhasDoMes(m: MonthSummary) {
  return m.contas.map(c => [
    m.nome,
    c.nome,
    CATEGORIA_MAP.get(c.categoria)?.label ?? c.categoria,
    formatValor(valorEfetivo(c)),
    `Dia ${c.vencimento}`,
    STATUS_LABEL[c.status_enum] ?? c.status_enum,
    c.status?.pago_em ? new Date(c.status.pago_em).toLocaleDateString('pt-BR') : '',
    c.status?.nota ?? '',
  ])
}

const CABECALHO = ['Mês', 'Conta', 'Categoria', 'Valor', 'Vencimento', 'Status', 'Pago em', 'Anotação']

export function gerarCsv(meses: MonthSummary[]): Blob {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const linhas = [CABECALHO, ...meses.flatMap(linhasDoMes)]
  const csv = '﻿' + linhas.map(l => l.map(escape).join(';')).join('\r\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}

export function gerarPdf(meses: MonthSummary[]): Blob {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.setTextColor(20, 30, 60)
  doc.text('Bubu — Contas da casa', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 25)

  let y = 32
  meses.forEach(m => {
    doc.setFontSize(13)
    doc.setTextColor(20, 30, 60)
    doc.text(m.nome, 14, y)
    autoTable(doc, {
      startY: y + 3,
      head: [CABECALHO.slice(1)],
      body: linhasDoMes(m).map(l => l.slice(1)),
      foot: [[
        'Total', '', formatValor(m.total), '',
        `Pago: ${formatValor(m.pago)}`, `Em aberto: ${formatValor(m.pendente)}`, '',
      ]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 39, 68], textColor: [212, 175, 55] },
      footStyles: { fillColor: [240, 240, 240], textColor: [26, 39, 68], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    if (y > 260) {
      doc.addPage()
      y = 18
    }
  })

  return doc.output('blob')
}

export async function compartilharArquivo(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
