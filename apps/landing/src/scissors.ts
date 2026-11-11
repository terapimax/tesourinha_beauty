/**
 * A tesoura da marca, desenhada como duas peças que giram no pino (60, 100) do viewBox.
 * A abertura vem da variável CSS --open (graus) no elemento pai, então o mesmo desenho
 * serve para o hero, o corte, a linha de corte e o cupom.
 *
 * Peça A: argola à esquerda, lâmina vai para a direita ao abrir (gira no sentido horário).
 * Peça B: o espelho.
 */
type Variant = 'hero' | 'cut' | 'rail' | 'mini' | 'mark'

let uid = 0

export function scissorsSVG(variant: Variant): string {
  const id = `scs${++uid}`
  const steel = variant === 'hero' || variant === 'cut'
  const blade = steel ? `url(#${id}-steel)` : 'currentColor'
  const ring = steel ? 'var(--sc-accent)' : 'currentColor'
  const defs = steel
    ? `<defs>
        <linearGradient id="${id}-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#8f877f"/>
          <stop offset="0.45" stop-color="#f6f1ec"/>
          <stop offset="0.6" stop-color="#d9d1c9"/>
          <stop offset="1" stop-color="#6f6862"/>
        </linearGradient>
      </defs>`
    : ''
  return `<svg class="scs scs--${variant}" viewBox="0 0 120 240" aria-hidden="true" focusable="false">${defs}
    <g class="scs__b">
      <path d="M60 106 C 64 130, 74 146, 80 160" fill="none" stroke="${ring}" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="86" cy="190" rx="19" ry="25" fill="none" stroke="${ring}" stroke-width="8"/>
      <path d="M63 112 L62 20 Q60 2 57 6 L53 100 Q54 110 57 114 Z" fill="${blade}"/>
    </g>
    <g class="scs__a">
      <path d="M60 106 C 56 130, 46 146, 40 160" fill="none" stroke="${ring}" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="34" cy="190" rx="19" ry="25" fill="none" stroke="${ring}" stroke-width="8"/>
      <path d="M57 112 L58 20 Q60 2 63 6 L67 100 Q66 110 63 114 Z" fill="${blade}"/>
    </g>
    <circle class="scs__pin" cx="60" cy="100" r="4.5"/>
  </svg>`
}

export function mountScissors(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-scissors]').forEach((el) => {
    el.innerHTML = scissorsSVG(el.dataset.scissors as Variant)
  })
}
