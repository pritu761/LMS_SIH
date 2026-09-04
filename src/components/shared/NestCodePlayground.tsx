'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';

interface CodeSnippet {
  id: string;
  filename: string;
  lang: string;
  description: string;
  code: string;
  output: string[];
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'module',
    filename: 'forecaster.module.ts',
    lang: 'typescript',
    description: 'Encapsulated Cadre Module with Inversion of Control Providers',
    code: `@Module({
  imports: [
    RadarTelemetryModule.register({ network: 'DWR_DUAL_POL_38' }),
    NwpHpcBridgeModule.forFeature({ cluster: 'PRATYUSH_MIHIR' }),
  ],
  controllers: [CompetencyGapController],
  providers: [
    {
      provide: FACULTY_ALLOCATION_ENGINE,
      useClass: FacultyWeightedMatcher, // 55% Skill, 30% Rating, 15% Batch
    },
    GapResolutionService,
  ],
  exports: [GapResolutionService],
})
export class ForecasterCadreModule {}`,
    output: [
      '[Nest] 2026-08-27 22:56:10  LOG [NestFactory] Starting IMD Capacity Engine...',
      '[Nest] 2026-08-27 22:56:10  LOG [InstanceLoader] RadarTelemetryModule dependencies initialized +18ms',
      '[Nest] 2026-08-27 22:56:10  LOG [InstanceLoader] NwpHpcBridgeModule dependencies initialized +4ms',
      '[Nest] 2026-08-27 22:56:10  LOG [InstanceLoader] ForecasterCadreModule dependencies initialized +6ms',
      '[Nest] 2026-08-27 22:56:10  LOG [RoutesResolver] CompetencyGapController {/api/v1/competency}: +2ms',
      '✔ ForecasterCadreModule ready with Inversion of Control Container active.',
    ],
  },
  {
    id: 'controller',
    filename: 'competency.controller.ts',
    lang: 'typescript',
    description: 'REST & WebSocket Endpoints with Strict Type-Safe Guards',
    code: `@Controller('competency')
@UseGuards(ImdCadreVerificationGuard)
export class CompetencyGapController {
  constructor(
    private readonly gapService: GapResolutionService,
    private readonly facultyMatcher: FacultyWeightedMatcher,
  ) {}

  @Get('evaluate/:officerId')
  @AuditLog('OFFICER_GAP_ASSESSMENT')
  async evaluateCadreGaps(
    @Param('officerId') id: string,
    @Query('cadre') cadre: 'DRSTC' | 'FTC' | 'IMTC',
  ): Promise<CadreGapReportDto> {
    const gaps = await this.gapService.findSkillGaps(id, cadre);
    const faculty = await this.facultyMatcher.rankTrainers(gaps, {
      skillWeight: 0.55,
      ratingWeight: 0.30,
      experienceWeight: 0.15,
    });
    return { officerId: id, gaps, recommendedFaculty: faculty };
  }
}`,
    output: [
      '[Nest] 2026-08-27 22:56:12  LOG [RouterExplorer] Mapped {/competency/evaluate/:officerId, GET} route +3ms',
      '[Nest] 2026-08-27 22:56:12  LOG [ImdCadreGuard] Verification token registered for DRSTC Inductee',
      '▶ Query: officerId="DRSTC-2026-089" (Scientist-B)',
      '⚡ Evaluated 4 Competencies: Dual-Pol Doppler (Gap: 28%), NWP 4D-Var (Gap: 14%)',
      '✔ Top Match: Prof. Vikramaditya Sen (Score: 94.6% Compatibility Index)',
    ],
  },
  {
    id: 'service',
    filename: 'allocation.service.ts',
    lang: 'typescript',
      description: 'The 55/30/15 Faculty Weighting Algorithm',
    code: `@Injectable()
export class FacultyWeightedMatcher {
  calculateIndex(
    skillOverlapPct: number, // 0-100%
    trainerStarRating: number, // 1.0 - 5.0
    completedCohorts: number, // Batches delivered
  ): AllocationResult {
    const skillScore = skillOverlapPct * 0.55;
    const ratingScore = (trainerStarRating / 5.0) * 100 * 0.30;
    const cohortScore = Math.min(completedCohorts / 10.0, 1.0) * 100 * 0.15;

    const totalIndex = Math.round(skillScore + ratingScore + cohortScore);

    return {
      compatibilityIndex: totalIndex,
      breakdown: { skillScore, ratingScore, cohortScore },
      isRecommended: totalIndex >= 85,
    };
  }
}`,
    output: [
      '[Engine] Invoking 55/30/15 Allocation Engine calculation...',
      '  ├─ Skill Overlap: 92% * 0.55 = 50.6 pts',
      '  ├─ Faculty Rating: 4.9★ * 0.30 = 29.4 pts',
      '  └─ Past Batches: 12 batches (capped @ 10) * 0.15 = 15.0 pts',
      '✔ Total Compatibility Score: 95.0% [HIGHLY RECOMMENDED]',
    ],
  },
  {
    id: 'guard',
    filename: 'radar-gap.guard.ts',
    lang: 'typescript',
    description: 'Dynamic Nowcasting Assessment & Cadre RBAC Guard',
    code: `@Injectable()
export class RadarTelemetryGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredCadre = this.reflector.get<string[]>('cadres', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.imdVerified) {
      throw new UnauthorizedException('Official IMD Credentials Required');
    }

    return requiredCadre ? requiredCadre.includes(user.cadreTrack) : true;
  }
}`,
    output: [
      '[Guard] RadarTelemetryGuard invoked on execution context',
      '  ├─ Auth Check: IMD Sovereign Identity verified (JWT SHA-256)',
      '  ├─ Role Check: DRSTC Forecaster Cadre present in claim payload',
      '✔ Execution granted for high-resolution Doppler telemetry stream',
    ],
  },
];

export function NestCodePlayground() {
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippet>(SNIPPETS[0]);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(SNIPPETS[0].output);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTab = (snippet: CodeSnippet) => {
    setActiveSnippet(snippet);
    setTerminalOutput(snippet.output);
    setIsRunning(false);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTerminalOutput(['[Nest] Compiling TypeScript AST...', '[Nest] Injecting Providers...']);
    setTimeout(() => {
      setTerminalOutput(activeSnippet.output);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="w-full rounded-[28px] bg-[#070305] border border-[#c59b48]/30 shadow-2xl shadow-[#0b1e36]/15 overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d0508] gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/90 inline-block shadow-sm shadow-rose-500" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-sans font-bold text-slate-200 flex items-center gap-2 pl-2 border-l border-white/10">
            <Code2 className="h-4 w-4 text-[#c59b48]" />
            <span>Architecture Code Sandbox</span>
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5">
          {SNIPPETS.map((snippet) => {
            const isActive = activeSnippet.id === snippet.id;
            return (
              <button
                key={snippet.id}
                onClick={() => handleSelectTab(snippet)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0b1e36] text-white border border-[#c59b48]/60 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {snippet.filename}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-slate-200 font-sans font-semibold transition-all hover:text-white"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/60 text-white text-xs font-bold font-sans shadow-md shadow-[#0b1e36]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Test'}</span>
          </button>
        </div>
      </div>

      {/* Description line */}
      <div className="px-5 py-2.5 bg-[#0a1220] border-b border-white/5 flex items-center justify-between text-xs text-slate-300 font-sans">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#c59b48]" />
          <span>{activeSnippet.description}</span>
        </span>
        <span className="text-[#c59b48] font-bold">TypeScript Decorator Paradigm</span>
      </div>

      {/* Split Code and Output Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Code editor view (7 cols) */}
        <div className="lg:col-span-7 p-5 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed bg-[#060a12] border-b lg:border-b-0 lg:border-r border-white/10 text-slate-100">
          <pre className="selection:bg-[#0b1e36] selection:text-white">
            <code>
              {activeSnippet.code.split('\n').map((line, idx) => {
                const isDecorator = line.trim().startsWith('@');
                const isComment = line.includes('//');
                const isKeyword = line.includes('export') || line.includes('class') || line.includes('constructor') || line.includes('async') || line.includes('return') || line.includes('private') || line.includes('readonly');

                return (
                  <div key={idx} className="flex hover:bg-white/[0.03] px-2 py-0.5 rounded">
                    <span className="w-8 select-none text-slate-500 text-right pr-4 text-[11px]">
                      {idx + 1}
                    </span>
                    <span
                      className={`flex-1 ${
                        isDecorator
                          ? 'text-[#c59b48] font-bold'
                          : isComment
                          ? 'text-slate-400 italic'
                          : isKeyword
                          ? 'text-cyan-300 font-medium'
                          : line.includes(':') || line.includes('{') || line.includes('}')
                          ? 'text-slate-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {line}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>

        {/* Terminal output view (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-[#04070d] flex flex-col justify-between font-mono text-xs text-slate-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Terminal className="h-3.5 w-3.5" />
                <span>Live Inversion-of-Control Console</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>

            <div className="space-y-2 text-[11px] leading-relaxed overflow-y-auto max-h-[300px] text-slate-600 dark:text-slate-300">
              {terminalOutput.map((log, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded ${
                    log.startsWith('✔')
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold'
                      : log.startsWith('[Nest]')
                      ? 'text-slate-500 dark:text-slate-400'
                      : log.startsWith('⚡') || log.startsWith('▶')
                      ? 'text-[#dfb76c]'
                      : 'text-slate-900 dark:text-slate-200'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-1 text-[#dfb76c] font-bold pt-1">
                <span>imd-cluster@capacity-connect:~$</span>
                <span className="cursor-blink">_</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
            <span>Fastify & TypeScript Core</span>
            <span className="text-[#dfb76c] font-sans font-bold">100% NestJS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}