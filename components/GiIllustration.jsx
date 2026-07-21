export default function GiIllustration() {
  return (
    <svg
      className="gi-illustration"
      viewBox="0 0 520 470"
      role="img"
      aria-labelledby="gi-title gi-description"
    >
      <title id="gi-title">A stylised Gi jacket and belt</title>
      <desc id="gi-description">A cream Gi jacket, tied with a brown belt, on a dark training mat.</desc>
      <defs>
        <linearGradient id="mat-glow" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#55412a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#171613" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gi-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffdf6" />
          <stop offset="0.55" stopColor="#e8e2d5" />
          <stop offset="1" stopColor="#c8c0b0" />
        </linearGradient>
        <linearGradient id="gi-sleeve" x1="0" y1="0" y2="0" x2="0.8" y2="1">
          <stop stopColor="#f8f3e7" />
          <stop offset="1" stopColor="#bdb4a4" />
        </linearGradient>
        <linearGradient id="belt" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b98142" />
          <stop offset="0.5" stopColor="#7a4b23" />
          <stop offset="1" stopColor="#3f2515" />
        </linearGradient>
        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#050504" floodOpacity="0.45" />
        </filter>
      </defs>

      <path d="M43 391C109 343 151 336 213 355C290 379 364 358 475 290V470H43Z" fill="url(#mat-glow)" />
      <path d="M38 365C143 319 261 408 482 282" fill="none" stroke="#d7ad67" strokeOpacity="0.16" strokeWidth="1.5" />
      <path d="M77 417C174 363 312 430 448 342" fill="none" stroke="#d7ad67" strokeOpacity="0.09" strokeWidth="1" />
      <ellipse cx="260" cy="399" rx="168" ry="29" fill="#070706" fillOpacity="0.44" />

      <g filter="url(#soft-shadow)">
        <path
          d="M194 101C210 71 235 55 260 55C285 55 310 71 326 101L367 163L333 190L321 164L332 366C289 383 231 383 188 366L199 164L187 190L153 163Z"
          fill="url(#gi-cloth)"
          stroke="#fffdf5"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
        <path
          d="M194 114L113 151C94 160 81 180 85 202L109 323C112 342 129 353 148 350L182 344L175 287L142 292L133 208L196 184Z"
          fill="url(#gi-sleeve)"
          stroke="#ded6c7"
          strokeWidth="2"
        />
        <path
          d="M326 114L407 151C426 160 439 180 435 202L410 323C408 342 391 353 372 350L338 344L345 287L378 292L387 208L324 184Z"
          fill="url(#gi-sleeve)"
          stroke="#ded6c7"
          strokeWidth="2"
        />
        <path d="M202 105L259 181L193 160L216 301L260 181L304 301L327 160L261 181L318 105" fill="#d3cbba" fillOpacity="0.55" />
        <path d="M203 104L260 181L318 104" fill="none" stroke="#aaa08e" strokeWidth="5" strokeLinejoin="round" />
        <path d="M208 113L260 180L312 113" fill="none" stroke="#fefcf5" strokeOpacity="0.8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M192 187L202 351" fill="none" stroke="#a79d8d" strokeOpacity="0.48" strokeWidth="2" />
        <path d="M328 187L318 351" fill="none" stroke="#a79d8d" strokeOpacity="0.48" strokeWidth="2" />
        <path d="M205 274C237 287 282 287 315 274" fill="none" stroke="#a99f8e" strokeOpacity="0.38" strokeWidth="2" />

        <path d="M146 288C179 277 214 280 244 294C275 308 326 306 371 284L376 310C323 338 272 340 235 323C208 311 177 309 145 318Z" fill="url(#belt)" />
        <path d="M144 297C180 286 214 290 244 303C275 317 325 315 373 292" fill="none" stroke="#dbad6a" strokeOpacity="0.56" strokeWidth="2" />
        <path d="M250 292C261 304 268 318 264 334L246 365L231 357L241 325L226 306Z" fill="#75451f" />
        <path d="M272 303C259 317 254 331 260 346L280 373L296 363L281 334L294 315Z" fill="#583418" />
        <path d="M245 329L258 340L274 328" fill="none" stroke="#d4a15e" strokeOpacity="0.48" strokeWidth="2" />
      </g>

      <g className="gi-illustration-details" fill="none" stroke="#d7ad67" strokeLinecap="round">
        <path d="M69 153H123" strokeWidth="1" strokeOpacity="0.45" />
        <path d="M69 153V205" strokeWidth="1" strokeOpacity="0.22" />
        <path d="M397 95H452" strokeWidth="1" strokeOpacity="0.45" />
        <path d="M452 95V147" strokeWidth="1" strokeOpacity="0.22" />
        <circle cx="69" cy="153" r="3" fill="#d7ad67" fillOpacity="0.7" stroke="none" />
        <circle cx="452" cy="95" r="3" fill="#d7ad67" fillOpacity="0.7" stroke="none" />
      </g>
    </svg>
  )
}
