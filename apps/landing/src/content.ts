/**
 * Conteúdo próprio da landing. Serviços e profissionais vêm do catálogo do app
 * (apps/mobile/src/data/catalog.ts); aqui ficam os cursos e os contatos do Projeto Tesourinha,
 * tirados do site antigo (curso-tesourinha.com.br) em 11/11/2026. Revise antes de cada turma.
 */

export const contact = {
  /** Número usado nos botões de WhatsApp do site antigo. */
  whatsapp: '5511999795965',
  whatsappLabel: '(11) 99979-5965',
  phone: '(11) 5096-2495',
  email: 'contato@curso-tesourinha.com.br',
  address: 'Av. Ibirapuera, 3501',
  city: 'São Paulo · SP · 04029-200',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Ibirapuera,+3501,+S%C3%A3o+Paulo+-+SP',
  instagram: 'https://www.instagram.com/projetotesourinha/',
  facebook: 'https://www.facebook.com/Tesourinha',
  youtube: 'https://www.youtube.com/channel/UCBKfxK4NtvafmCHI6c9PVKw',
}

export const whatsappLink = (text: string) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`

export interface LandingCourse {
  id: string
  name: string
  /** Carga horária como o projeto publica. */
  load: string
  /** Formato e turmas. */
  when: string
  summary: string
  modules: string[]
  note?: string
}

export const courses: LandingCourse[] = [
  {
    id: 'cabeleireiro',
    name: 'Cabeleireiro',
    load: '104 horas · 13 aulas',
    when: 'Segundas, das 9h às 17h',
    summary: 'O primeiro passo da carreira: do atendimento ao corte, com prática desde a primeira aula.',
    modules: ['Atendimento ao cliente', 'Lavatório e tratamentos', 'Escovação', 'Base para penteados', 'Introdução à colorimetria', 'Coloração e mechas', 'Base e ângulos de corte', 'Biossegurança'],
  },
  {
    id: 'barbearia',
    name: 'Barbearia intensivo',
    load: '64 horas (manhã) ou 52 horas (noite) · 13 aulas',
    when: 'Segundas, das 9h às 15h ou das 16h às 20h',
    summary: 'Barbearia clássica e contemporânea, com prática em modelos reais.',
    modules: ['Biossegurança', 'Barbearia clássica e contemporânea', 'Ferramentas', 'Cuidados com a pele masculina', 'Barbas e cortes', 'Químicas: platinado, luzes, relaxamento e botox capilar', 'Barboterapia'],
  },
  {
    id: 'acelerador',
    name: '5 em 1 · Acelerador de carreira',
    load: '4 dias intensivos',
    when: 'Das 10h às 16h',
    summary: 'Especialização para cabeleireiros e barbeiros que já atendem e querem ir além.',
    modules: ['Penteados russos para noivas', 'Lavagem pelo método japonês', 'Tricologia básica', 'Corte profissional e visagismo', 'Escova profissional'],
    note: 'Com certificado. O aluno traz o próprio material.',
  },
  {
    id: 'sobrancelha',
    name: 'Design de sobrancelha',
    load: '12 horas · 2 aulas',
    when: 'Segunda, das 9h às 17h, e terça, das 9h às 12h',
    summary: 'Marcação pelo visagismo, pinça e henna, em dois dias.',
    modules: ['Visagismo e marcação', 'Design com pinça', 'Aplicação de henna'],
  },
  {
    id: 'lash',
    name: 'Lash design · técnica express',
    load: '11 horas · 2 aulas',
    when: 'Segunda, das 9h às 17h, e terça, das 9h às 12h',
    summary: 'Aplicação de cílios do fio a fio ao volume, com técnica rápida.',
    modules: ['Tipos e tamanhos de cílios', 'Fio a fio, volume brasileiro, híbrido e express', 'Colagem e remoção', 'Cuidados e manutenção'],
    note: 'Material incluso para uso em sala.',
  },
  {
    id: 'depilacao',
    name: 'Depilação',
    load: '24 horas · 8 semanas',
    when: 'Terças, das 9h às 12h',
    summary: 'Cera fria, quente e roll-on, com prática em todas as áreas do corpo.',
    modules: ['Cuidados pré e pós-depilação', 'Ficha de avaliação', 'Mitos e verdades', 'Cera fria, quente e roll-on', 'Prática, incluindo depilação artística'],
  },
  {
    id: 'caobeleireiro',
    name: 'Cãobeleireiro · banho e tosa',
    load: '24 horas · 8 aulas',
    when: 'Turma das 13h às 16h',
    summary: 'Para quem ama animais e quer fazer disso uma profissão.',
    modules: ['Materiais, escovas e pentes', 'Tosa de exposição e pet shop', 'Cortes especiais', 'Higiene do animal', 'Comportamento animal'],
    note: 'Material incluso para uso em sala.',
  },
]
