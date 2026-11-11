import type { Category, Course, Job, Professional, Service } from './types';

/**
 * Dados de exemplo do MVP. Em produção virão do Supabase
 * (ver /supabase/migrations) e serão gerenciados pelo painel admin.
 */

export const categories: Category[] = [
  { id: 'cabelo', name: 'Cabelo', icon: 'cut-outline' },
  { id: 'barba', name: 'Barba', icon: 'man-outline' },
  { id: 'estetica', name: 'Estética', icon: 'sparkles-outline' },
  { id: 'unhas', name: 'Manicure', icon: 'hand-left-outline' },
  { id: 'depilacao', name: 'Depilação', icon: 'leaf-outline' },
  { id: 'spa', name: 'Spa', icon: 'water-outline' },
  { id: 'maquiagem', name: 'Maquiagem', icon: 'color-palette-outline' },
];

export const services: Service[] = [
  { id: 's-corte-fem', categoryId: 'cabelo', name: 'Corte Feminino', description: 'Corte personalizado com lavagem e finalização.', durationMin: 60, priceFrom: 80, icon: 'cut-outline' },
  { id: 's-corte-masc', categoryId: 'cabelo', name: 'Corte Masculino', description: 'Corte clássico ou moderno, com acabamento na navalha.', durationMin: 40, priceFrom: 45, icon: 'cut-outline' },
  { id: 's-coloracao', categoryId: 'cabelo', name: 'Coloração / Mechas', description: 'Coloração global, mechas, luzes ou morena iluminada.', durationMin: 180, priceFrom: 220, icon: 'color-fill-outline' },
  { id: 's-escova', categoryId: 'cabelo', name: 'Escova', description: 'Escova modelada ou lisa com produtos profissionais.', durationMin: 45, priceFrom: 55, icon: 'flame-outline' },
  { id: 's-tratamento', categoryId: 'cabelo', name: 'Tratamentos Capilares', description: 'Hidratação, nutrição, reconstrução e cronograma capilar.', durationMin: 60, priceFrom: 90, icon: 'flask-outline' },
  { id: 's-barba', categoryId: 'barba', name: 'Barba', description: 'Barba desenhada com toalha quente e hidratação.', durationMin: 30, priceFrom: 40, icon: 'man-outline' },
  { id: 's-manicure', categoryId: 'unhas', name: 'Manicure e Pedicure', description: 'Cutilagem, esmaltação tradicional ou em gel.', durationMin: 75, priceFrom: 60, icon: 'hand-left-outline' },
  { id: 's-facial', categoryId: 'estetica', name: 'Estética Facial', description: 'Limpeza de pele profunda, peeling e revitalização.', durationMin: 70, priceFrom: 130, icon: 'happy-outline' },
  { id: 's-sobrancelha', categoryId: 'estetica', name: 'Design de Sobrancelhas', description: 'Design com pinça, henna ou brow lamination.', durationMin: 40, priceFrom: 50, icon: 'eye-outline' },
  { id: 's-depilacao', categoryId: 'depilacao', name: 'Depilação', description: 'Depilação com cera quente, fria ou linha.', durationMin: 45, priceFrom: 45, icon: 'leaf-outline' },
  { id: 's-spa', categoryId: 'spa', name: 'Spa e Bem-estar', description: 'Massagem relaxante, pedras quentes e aromaterapia.', durationMin: 60, priceFrom: 140, icon: 'water-outline' },
  { id: 's-make', categoryId: 'maquiagem', name: 'Maquiagem Social', description: 'Make para eventos, festas e ensaios.', durationMin: 60, priceFrom: 150, icon: 'color-palette-outline' },
];

const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export const professionals: Professional[] = [
  {
    id: 'p-ana', name: 'Ana Paula', role: 'Cabeleireira', categoryIds: ['cabelo'],
    serviceIds: ['s-corte-fem', 's-escova', 's-tratamento', 's-coloracao'],
    rating: 5.0, reviewsCount: 120, distanceKm: 1.2, neighborhood: 'Santo Amaro, SP',
    bio: 'Especialista em cortes femininos e finalização. Formada pela Associação Tesourinha, apaixonada por realçar a beleza natural de cada cliente.',
    yearsExperience: 9, tesourinhaAlumni: true, avatarColor: '#FF8A3D', workingHours: hours,
    reviews: [
      { id: 'r1', author: 'Juliana M.', rating: 5, comment: 'Atendimento impecável! Saí do salão me sentindo outra pessoa.', date: '2026-10-28' },
      { id: 'r2', author: 'Patrícia S.', rating: 5, comment: 'A Ana entende exatamente o que a gente quer. Recomendo muito.', date: '2026-10-12' },
    ],
  },
  {
    id: 'p-carlos', name: 'Carlos Silva', role: 'Barbeiro', categoryIds: ['barba', 'cabelo'],
    serviceIds: ['s-corte-masc', 's-barba'],
    rating: 4.9, reviewsCount: 98, distanceKm: 1.4, neighborhood: 'Campo Limpo, SP',
    bio: 'Barbeiro clássico com toque moderno. Degradê, navalhado e barba terapia.',
    yearsExperience: 7, tesourinhaAlumni: true, avatarColor: '#3A3A3C', workingHours: hours,
    reviews: [
      { id: 'r3', author: 'Rafael T.', rating: 5, comment: 'Melhor degradê da região. Pontual e caprichoso.', date: '2026-11-02' },
      { id: 'r4', author: 'Bruno L.', rating: 4.8, comment: 'Ambiente top e atendimento rápido.', date: '2026-10-20' },
    ],
  },
  {
    id: 'p-mariana', name: 'Mariana Costa', role: 'Colorista', categoryIds: ['cabelo'],
    serviceIds: ['s-coloracao', 's-tratamento', 's-escova'],
    rating: 5.0, reviewsCount: 76, distanceKm: 2.1, neighborhood: 'Moema, SP',
    bio: 'Colorista com foco em loiros saudáveis, morena iluminada e correção de cor.',
    yearsExperience: 11, tesourinhaAlumni: false, avatarColor: '#E5560A', workingHours: hours,
    reviews: [
      { id: 'r5', author: 'Camila R.', rating: 5, comment: 'Meu loiro nunca ficou tão bonito e o cabelo continua saudável!', date: '2026-10-30' },
    ],
  },
  {
    id: 'p-lucas', name: 'Lucas Mendes', role: 'Especialista em Mechas', categoryIds: ['cabelo'],
    serviceIds: ['s-coloracao', 's-corte-fem'],
    rating: 4.8, reviewsCount: 62, distanceKm: 2.3, neighborhood: 'Jardim São Luís, SP',
    bio: 'Mechas, balayage e técnicas de iluminação. Aluno destaque da turma 2019 da Tesourinha.',
    yearsExperience: 6, tesourinhaAlumni: true, avatarColor: '#1C1C1E', workingHours: hours,
    reviews: [
      { id: 'r6', author: 'Fernanda P.', rating: 4.8, comment: 'Balayage perfeito, muito profissional.', date: '2026-10-08' },
    ],
  },
  {
    id: 'p-fernanda', name: 'Fernanda Alves', role: 'Esteticista', categoryIds: ['estetica', 'depilacao', 'spa'],
    serviceIds: ['s-facial', 's-sobrancelha', 's-depilacao', 's-spa'],
    rating: 5.0, reviewsCount: 84, distanceKm: 2.5, neighborhood: 'Capão Redondo, SP',
    bio: 'Esteticista facial e corporal. Protocolos personalizados para cada tipo de pele.',
    yearsExperience: 8, tesourinhaAlumni: true, avatarColor: '#FF6A13', workingHours: hours,
    reviews: [
      { id: 'r7', author: 'Larissa C.', rating: 5, comment: 'Limpeza de pele maravilhosa, mãos de fada!', date: '2026-11-05' },
    ],
  },
  {
    id: 'p-jessica', name: 'Jéssica Rocha', role: 'Manicure e Nail Designer', categoryIds: ['unhas'],
    serviceIds: ['s-manicure'],
    rating: 4.9, reviewsCount: 143, distanceKm: 0.8, neighborhood: 'Santo Amaro, SP',
    bio: 'Alongamento em gel, nail art e cuidados completos com mãos e pés.',
    yearsExperience: 5, tesourinhaAlumni: true, avatarColor: '#FF9F5A', workingHours: hours,
    reviews: [
      { id: 'r8', author: 'Aline F.', rating: 5, comment: 'Unhas lindas e duram muito. Super caprichosa.', date: '2026-11-01' },
    ],
  },
  {
    id: 'p-renata', name: 'Renata Lima', role: 'Maquiadora', categoryIds: ['maquiagem', 'estetica'],
    serviceIds: ['s-make', 's-sobrancelha'],
    rating: 4.9, reviewsCount: 57, distanceKm: 3.1, neighborhood: 'Vila Andrade, SP',
    bio: 'Maquiagem social, noivas e editoriais. Pele iluminada e duradoura.',
    yearsExperience: 10, tesourinhaAlumni: false, avatarColor: '#2C2C2E', workingHours: hours,
    reviews: [
      { id: 'r9', author: 'Bianca O.', rating: 5, comment: 'Make perfeita para meu casamento, durou a noite toda!', date: '2026-09-21' },
    ],
  },
];

export const courseCategories = [
  { id: 'todos', name: 'Todos' },
  { id: 'cabelo', name: 'Cabeleireiro' },
  { id: 'barba', name: 'Barbeiro' },
  { id: 'estetica', name: 'Estética' },
  { id: 'unhas', name: 'Unhas' },
  { id: 'gestao', name: 'Gestão' },
] as const;

export const courses: Course[] = [
  {
    id: 'c-cabeleireiro', title: 'Curso de Cabeleireiro', subtitle: 'Básico e Avançado', categoryId: 'cabelo',
    level: 'Iniciante', durationHours: 120, modality: 'Presencial', startDate: '2026-12-01', seats: 30, seatsTaken: 22,
    icon: 'cut-outline', certificate: true,
    description: 'Formação completa em cabeleireiro: visagismo, cortes, escovas, química e atendimento. Turmas práticas com modelos reais.',
    modules: ['Fundamentos e visagismo', 'Técnicas de corte feminino', 'Escova e finalização', 'Coloração e química', 'Atendimento e postura profissional'],
  },
  {
    id: 'c-barbeiro', title: 'Curso de Barbeiro', subtitle: 'Do básico ao profissional', categoryId: 'barba',
    level: 'Iniciante', durationHours: 80, modality: 'Presencial', startDate: '2026-12-08', seats: 25, seatsTaken: 25,
    icon: 'man-outline', certificate: true,
    description: 'Aprenda cortes masculinos clássicos e modernos, degradê, navalha e barboterapia.',
    modules: ['Ferramentas e higiene', 'Cortes clássicos', 'Degradê e freestyle', 'Barba e barboterapia'],
  },
  {
    id: 'c-manicure', title: 'Manicure e Pedicure', subtitle: 'Beleza e saúde nas suas mãos', categoryId: 'unhas',
    level: 'Iniciante', durationHours: 40, modality: 'Presencial', startDate: '2026-11-24', seats: 20, seatsTaken: 9,
    icon: 'hand-left-outline', certificate: true,
    description: 'Técnicas de cutilagem, esmaltação, biossegurança e introdução à nail art.',
    modules: ['Biossegurança', 'Cutilagem', 'Esmaltação perfeita', 'Nail art básica'],
  },
  {
    id: 'c-depilacao', title: 'Depilação', subtitle: 'Técnicas profissionais', categoryId: 'estetica',
    level: 'Iniciante', durationHours: 24, modality: 'Presencial', startDate: '2026-12-15', seats: 18, seatsTaken: 4,
    icon: 'leaf-outline', certificate: true,
    description: 'Depilação com cera quente e fria, linha e cuidados pós-depilação.',
    modules: ['Tipos de pele e pelos', 'Cera quente e fria', 'Depilação com linha'],
  },
  {
    id: 'c-facial', title: 'Estética Facial', subtitle: 'Cuidados e bem-estar', categoryId: 'estetica',
    level: 'Intermediário', durationHours: 60, modality: 'Híbrido', startDate: '2027-01-12', seats: 20, seatsTaken: 11,
    icon: 'sparkles-outline', certificate: true,
    description: 'Limpeza de pele, protocolos faciais, análise de pele e cosmetologia.',
    modules: ['Anatomia da pele', 'Limpeza de pele', 'Protocolos e peelings', 'Cosmetologia'],
  },
  {
    id: 'c-empreender', title: 'Empreendedorismo', subtitle: 'Gestão e atendimento', categoryId: 'gestao',
    level: 'Iniciante', durationHours: 16, modality: 'Online', startDate: '2026-11-20', seats: 200, seatsTaken: 134,
    icon: 'briefcase-outline', certificate: true,
    description: 'Como abrir seu próprio negócio de beleza: precificação, redes sociais, MEI e fidelização.',
    modules: ['Precificação', 'Marketing nas redes sociais', 'Formalização e MEI', 'Fidelização de clientes'],
  },
];

export const jobs: Job[] = [
  {
    id: 'j-cabeleireiro', title: 'Cabeleireiro(a)', company: 'Salão Bella Vista', location: 'Zona Sul - SP',
    type: 'Tempo integral', salary: 'R$ 2.500 + comissão', postedAt: '2026-11-09', icon: 'cut-outline',
    description: 'Buscamos cabeleireiro(a) com experiência em cortes e escovas para equipe em crescimento.',
    requirements: ['Experiência mínima de 1 ano', 'Disponibilidade aos sábados', 'Boa comunicação'],
    benefits: ['Vale-transporte', 'Comissão de 40%', 'Cursos de atualização'],
  },
  {
    id: 'j-barbeiro', title: 'Barbeiro(a)', company: 'Barbearia Parceira', location: 'Campo Limpo - SP',
    type: 'Meio período', salary: 'Comissionado', postedAt: '2026-11-07', icon: 'man-outline',
    description: 'Barbearia parceira da Tesourinha contrata barbeiro(a) para período da tarde.',
    requirements: ['Domínio de degradê', 'Curso de barbeiro concluído'],
    benefits: ['Comissão de 50%', 'Ambiente climatizado'],
  },
  {
    id: 'j-manicure', title: 'Manicure', company: 'Clínica de Estética Lumi', location: 'Moema - SP',
    type: 'Tempo integral', salary: 'R$ 1.900 + comissão', postedAt: '2026-11-05', icon: 'hand-left-outline',
    description: 'Vaga para manicure e pedicure com conhecimento em esmaltação em gel.',
    requirements: ['Certificado de biossegurança', 'Experiência com gel'],
    benefits: ['Vale-refeição', 'Plano de saúde após 3 meses'],
  },
  {
    id: 'j-esteticista', title: 'Esteticista', company: 'Spa e Bem-estar Aura', location: 'Vila Mariana - SP',
    type: 'Meio período', postedAt: '2026-11-03', icon: 'sparkles-outline',
    description: 'Atendimento facial e corporal em spa urbano.',
    requirements: ['Formação em estética', 'Experiência com protocolos faciais'],
    benefits: ['Horário flexível', 'Desconto em tratamentos'],
  },
  {
    id: 'j-recepcionista', title: 'Recepcionista', company: 'Salão de Beleza Glow', location: 'Santo Amaro - SP',
    type: 'Tempo integral', salary: 'R$ 1.800', postedAt: '2026-11-01', icon: 'call-outline',
    description: 'Recepção, agenda de clientes e atendimento via WhatsApp.',
    requirements: ['Ensino médio completo', 'Boa organização'],
    benefits: ['Vale-transporte', 'Vale-refeição'],
  },
];

export const association = {
  name: 'Associação Tesourinha',
  years: 37,
  tagline: 'Mais de 37 anos transformando vidas por meio da beleza e da educação.',
  pillars: [
    { icon: 'school-outline', title: 'Qualificação', text: 'Cursos gratuitos de beleza com certificado.' },
    { icon: 'briefcase-outline', title: 'Oportunidade', text: 'Conexão com salões parceiros e vagas de emprego.' },
    { icon: 'heart-outline', title: 'Impacto social', text: 'Geração de renda e autonomia para a comunidade.' },
  ] as const,
  stats: [
    { value: '37+', label: 'anos de história' },
    { value: '100%', label: 'cursos gratuitos' },
    { value: 'Com', label: 'certificado' },
  ],
};

export const findProfessional = (id: string) => professionals.find((p) => p.id === id);
export const findService = (id: string) => services.find((s) => s.id === id);
export const findCourse = (id: string) => courses.find((c) => c.id === id);
export const findJob = (id: string) => jobs.find((j) => j.id === id);
