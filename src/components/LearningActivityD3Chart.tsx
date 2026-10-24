import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Calendar, 
  Info, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { UserProgress, WeeklyActivityPoint } from '../types';

interface LearningActivityD3ChartProps {
  progress: UserProgress;
  onQuickLogHours?: (hours: number, xp: number) => void;
}

export const LearningActivityD3Chart: React.FC<LearningActivityD3ChartProps> = ({
  progress,
  onQuickLogHours,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeMetricView, setActiveMetricView] = useState<'dual' | 'hours' | 'velocity'>('dual');
  const [timeframeWeeks, setTimeframeWeeks] = useState<number>(8);
  const [hoveredPoint, setHoveredPoint] = useState<WeeklyActivityPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate realistic weekly activity & XP velocity data leading up to the current week
  const weeklyData: WeeklyActivityPoint[] = useMemo(() => {
    const points: WeeklyActivityPoint[] = [];
    const now = new Date();
    // Monday of current week
    const currentDay = now.getDay();
    const diffToMonday = (currentDay + 6) % 7;
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - diffToMonday);

    // Baseline historical patterns for working professionals
    const historicalHours = [2.2, 3.0, 1.8, 3.5, 4.2, 3.8, 4.6, 5.2, 4.0, 4.8, 5.0, 5.5];
    const historicalXp = [90, 140, 75, 180, 240, 210, 270, 320, 250, 310, 340, 380];
    const historicalLessons = [1, 2, 0, 2, 3, 2, 4, 4, 3, 4, 4, 5];
    const historicalArticles = [2, 3, 2, 4, 5, 4, 6, 7, 5, 6, 7, 8];

    for (let i = timeframeWeeks - 1; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const isCurrentWeek = i === 0;

      // Use progress values for current week
      const currentWeekHours = Number(Math.max(0.5, progress.weeklyHoursLogged).toFixed(1));
      const currentWeekXp = Math.max(50, Math.round(progress.xp * 0.35));

      const histIndex = (historicalHours.length - i - 1 + historicalHours.length) % historicalHours.length;
      const hours = isCurrentWeek ? currentWeekHours : historicalHours[histIndex];
      const xpGained = isCurrentWeek ? currentWeekXp : historicalXp[histIndex];
      const lessons = isCurrentWeek ? Math.max(1, progress.completedLessonIds.length % 5) : historicalLessons[histIndex];
      const articles = isCurrentWeek ? Math.max(1, progress.readArticleIds.length % 6) : historicalArticles[histIndex];

      // XP velocity = rate of XP accumulation per active hour
      const xpVelocity = Number((xpGained / Math.max(0.8, hours)).toFixed(1));

      // Calculate change percent relative to previous point
      let velocityChangePercent = 0;
      if (points.length > 0) {
        const prevVelocity = points[points.length - 1].xpVelocity;
        velocityChangePercent = Math.round(((xpVelocity - prevVelocity) / prevVelocity) * 100);
      }

      const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();

      points.push({
        weekKey: `w-${i}`,
        label: `${startMonth} ${startDay}`,
        startDate: `${startMonth} ${startDay}`,
        endDate: `${weekEnd.toLocaleDateString('en-US', { month: 'short' })} ${endDay}`,
        hours,
        xpGained,
        xpVelocity,
        velocityChangePercent,
        lessonsCompleted: lessons,
        articlesRead: articles,
        isCurrentWeek,
      });
    }

    return points;
  }, [timeframeWeeks, progress.weeklyHoursLogged, progress.xp, progress.completedLessonIds.length, progress.readArticleIds.length]);

  // Key KPI stats derived from the series
  const currentWeek = weeklyData[weeklyData.length - 1];
  const prevWeek = weeklyData[weeklyData.length - 2] || currentWeek;
  const avgHours = Number((weeklyData.reduce((acc, p) => acc + p.hours, 0) / weeklyData.length).toFixed(1));
  const avgVelocity = Math.round(weeklyData.reduce((acc, p) => acc + p.xpVelocity, 0) / weeklyData.length);
  const velocityDelta = currentWeek.velocityChangePercent;
  const maxWeeklyHours = Math.max(...weeklyData.map((d) => d.hours), progress.targetWeeklyHours);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = 340;
    const margin = { top: 28, right: 54, bottom: 42, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create defs for gradients and glow filters
    const defs = svg.append('defs');

    // Hours Area Gradient (Indigo to Cyan)
    const hoursGradient = defs.append('linearGradient')
      .attr('id', 'hoursAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    hoursGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.45);
    hoursGradient.append('stop').attr('offset', '60%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.15);
    hoursGradient.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // XP Velocity Gradient (Amber to Emerald)
    const velocityGradient = defs.append('linearGradient')
      .attr('id', 'velocityAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    velocityGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.4);
    velocityGradient.append('stop').attr('offset', '70%').attr('stop-color', '#10b981').attr('stop-opacity', 0.1);
    velocityGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Glow filter for curve lines
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3.scalePoint<string>()
      .domain(weeklyData.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Scale Left (Hours)
    const maxH = Math.max(progress.targetWeeklyHours + 1.5, d3.max(weeklyData, (d) => d.hours) || 6);
    const yScaleHours = d3.scaleLinear()
      .domain([0, maxH])
      .nice()
      .range([innerHeight, 0]);

    // Y Scale Right (XP Velocity - XP/hr or XP total)
    const maxVelocity = (d3.max(weeklyData, (d) => d.xpVelocity) || 80) * 1.25;
    const yScaleVelocity = d3.scaleLinear()
      .domain([0, maxVelocity])
      .nice()
      .range([innerHeight, 0]);

    // Background horizontal grid lines
    const yGrid = d3.axisLeft(yScaleHours)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.35)
      .attr('stroke-dasharray', '3 3');
    g.select('.grid .domain').remove();

    // Target Weekly Hours reference line
    const targetY = yScaleHours(progress.targetWeeklyHours);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', targetY)
      .attr('y2', targetY)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5 4')
      .attr('opacity', 0.7);

    g.append('text')
      .attr('x', innerWidth - 6)
      .attr('y', targetY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#34d399')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .text(`Weekly Goal: ${progress.targetWeeklyHours}h`);

    // Generators
    const hoursAreaGenerator = d3.area<WeeklyActivityPoint>()
      .x((d) => xScale(d.label) || 0)
      .y0(innerHeight)
      .y1((d) => yScaleHours(d.hours))
      .curve(d3.curveMonotoneX);

    const hoursLineGenerator = d3.line<WeeklyActivityPoint>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScaleHours(d.hours))
      .curve(d3.curveMonotoneX);

    const velocityAreaGenerator = d3.area<WeeklyActivityPoint>()
      .x((d) => xScale(d.label) || 0)
      .y0(innerHeight)
      .y1((d) => yScaleVelocity(d.xpVelocity))
      .curve(d3.curveMonotoneX);

    const velocityLineGenerator = d3.line<WeeklyActivityPoint>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScaleVelocity(d.xpVelocity))
      .curve(d3.curveMonotoneX);

    // 1. Draw Hours Area & Line (if active view is 'dual' or 'hours')
    if (activeMetricView === 'dual' || activeMetricView === 'hours') {
      g.append('path')
        .datum(weeklyData)
        .attr('fill', 'url(#hoursAreaGrad)')
        .attr('d', hoursAreaGenerator);

      g.append('path')
        .datum(weeklyData)
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#glow)')
        .attr('d', hoursLineGenerator);

      // Dots on hours line
      g.selectAll('.dot-hour')
        .data(weeklyData)
        .enter()
        .append('circle')
        .attr('class', 'dot-hour')
        .attr('cx', (d) => xScale(d.label) || 0)
        .attr('cy', (d) => yScaleHours(d.hours))
        .attr('r', (d) => (d.isCurrentWeek ? 6 : 4))
        .attr('fill', (d) => (d.isCurrentWeek ? '#a5b4fc' : '#6366f1'))
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2);
    }

    // 2. Draw XP Velocity Area & Line (if active view is 'dual' or 'velocity')
    if (activeMetricView === 'dual' || activeMetricView === 'velocity') {
      if (activeMetricView === 'velocity') {
        g.append('path')
          .datum(weeklyData)
          .attr('fill', 'url(#velocityAreaGrad)')
          .attr('d', velocityAreaGenerator);
      }

      g.append('path')
        .datum(weeklyData)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', activeMetricView === 'dual' ? '4 2' : 'none')
        .attr('filter', 'url(#glow)')
        .attr('d', velocityLineGenerator);

      // Dots on velocity line
      g.selectAll('.dot-velocity')
        .data(weeklyData)
        .enter()
        .append('circle')
        .attr('class', 'dot-velocity')
        .attr('cx', (d) => xScale(d.label) || 0)
        .attr('cy', (d) => yScaleVelocity(d.xpVelocity))
        .attr('r', (d) => (d.isCurrentWeek ? 5 : 3.5))
        .attr('fill', '#f59e0b')
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2);
    }

    // Current Week Pulse Marker
    if (currentWeek) {
      const cx = xScale(currentWeek.label) || 0;
      const cy = activeMetricView === 'velocity' ? yScaleVelocity(currentWeek.xpVelocity) : yScaleHours(currentWeek.hours);

      const pulse = g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 10)
        .attr('fill', 'none')
        .attr('stroke', activeMetricView === 'velocity' ? '#f59e0b' : '#818cf8')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8);

      pulse.append('animate')
        .attr('attributeName', 'r')
        .attr('values', '6;16;6')
        .attr('dur', '2.5s')
        .attr('repeatCount', 'indefinite');

      pulse.append('animate')
        .attr('attributeName', 'opacity')
        .attr('values', '0.8;0;0.8')
        .attr('dur', '2.5s')
        .attr('repeatCount', 'indefinite');
    }

    // Axes
    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(12);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', '600');
    g.select('g:last-child .domain').attr('stroke', '#334155');

    // Left Axis (Hours)
    if (activeMetricView === 'dual' || activeMetricView === 'hours') {
      const yAxisLeft = d3.axisLeft(yScaleHours).ticks(5).tickFormat((d) => `${d}h`);
      g.append('g')
        .call(yAxisLeft)
        .selectAll('text')
        .attr('fill', '#818cf8')
        .attr('font-size', '11px')
        .attr('font-weight', '700');
      g.select('g:last-child .domain').remove();
    }

    // Right Axis (XP Velocity)
    if (activeMetricView === 'dual' || activeMetricView === 'velocity') {
      const yAxisRight = d3.axisRight(yScaleVelocity).ticks(5).tickFormat((d) => `${d} v`);
      g.append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(yAxisRight)
        .selectAll('text')
        .attr('fill', '#fbbf24')
        .attr('font-size', '11px')
        .attr('font-weight', '700');
      g.select('g:last-child .domain').remove();
    }

    // Crosshair line for hover
    const crosshair = g.append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0);

    // Interactive Hover Overlay
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      // Find closest week point
      let closestPoint = weeklyData[0];
      let minDistance = Infinity;

      weeklyData.forEach((d) => {
        const x = xScale(d.label) || 0;
        const dist = Math.abs(x - mouseX);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = d;
        }
      });

      const ptX = xScale(closestPoint.label) || 0;
      crosshair
        .attr('x1', ptX)
        .attr('x2', ptX)
        .attr('opacity', 0.85);

      setHoveredPoint(closestPoint);
      setTooltipPos({
        x: ptX + margin.left,
        y: Math.min(innerHeight - 20, Math.max(margin.top, yScaleHours(closestPoint.hours) + margin.top)),
      });
    });

    overlay.on('mouseleave', () => {
      crosshair.attr('opacity', 0);
      setHoveredPoint(null);
      setTooltipPos(null);
    });
  }, [weeklyData, activeMetricView, progress.targetWeeklyHours]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 text-indigo-300 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Weekly Activity Trends & XP Velocity
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  D3 Interactive Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-series monitoring of study hours, throughput velocity (XP/hr), and consistency momentum
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveMetricView('dual')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMetricView === 'dual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setActiveMetricView('hours')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMetricView === 'hours'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hours Only
            </button>
            <button
              onClick={() => setActiveMetricView('velocity')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMetricView === 'velocity'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              XP Velocity
            </button>
          </div>

          {/* Timeframe Selector */}
          <select
            value={timeframeWeeks}
            onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value={6}>Last 6 Weeks</option>
            <option value={8}>Last 8 Weeks</option>
            <option value={12}>Last 12 Weeks</option>
          </select>

          {/* Quick Simulation CTA to demonstrate live reactivity */}
          {onQuickLogHours && (
            <button
              onClick={() => onQuickLogHours(1.0, 50)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Simulate completing an exercise session"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+1h Study</span>
            </button>
          )}
        </div>
      </div>

      {/* Derived Metric Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current XP Velocity */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current XP Velocity
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-amber-400">
              {currentWeek?.xpVelocity || 0}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">XP/active hr</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] font-bold mt-1 text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{Math.abs(velocityDelta)}% vs prior week</span>
          </div>
        </div>

        {/* Avg Weekly Study */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Weekly Average Time
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-indigo-400">
              {avgHours}h
            </span>
            <span className="text-[11px] font-semibold text-slate-400">/ week</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target: {progress.targetWeeklyHours}h ({Math.round((avgHours / progress.targetWeeklyHours) * 100)}% pacing)
          </span>
        </div>

        {/* Momentum Acceleration */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Momentum Phase
          </span>
          <div className="flex items-center space-x-1.5 text-sm font-extrabold text-white mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>High Acceleration</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Streak: {progress.streakDays} Consecutive Days
          </span>
        </div>

        {/* Peak Learning Week */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Peak Week Performance
          </span>
          <div className="text-xl font-black text-cyan-400">
            {Math.max(...weeklyData.map((w) => w.xpGained))} XP
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Max volume recorded
          </span>
        </div>
      </div>

      {/* Interactive Legend Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs px-2 pt-1">
        <div className="flex items-center space-x-4">
          {(activeMetricView === 'dual' || activeMetricView === 'hours') && (
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <span className="font-semibold">Weekly Study Hours (Solid Line)</span>
            </div>
          )}

          {(activeMetricView === 'dual' || activeMetricView === 'velocity') && (
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              <span className="font-semibold">XP Gain Velocity (Dashed Line)</span>
            </div>
          )}

          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-3 h-0.5 border-t border-dashed border-emerald-400" />
            <span className="font-medium">Goal Threshold ({progress.targetWeeklyHours}h)</span>
          </div>
        </div>

        <span className="text-slate-500 text-[11px]">
          Hover over data points to inspect detailed metrics
        </span>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[340px] select-none"
        />

        {/* Floating Custom Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-950/95 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs w-60 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-extrabold text-white text-xs">
                {hoveredPoint.startDate} - {hoveredPoint.endDate}
              </span>
              {hoveredPoint.isCurrentWeek && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Current Week
                </span>
              )}
            </div>

            <div className="mt-2.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                  Study Hours:
                </span>
                <span className="font-bold text-white">
                  {hoveredPoint.hours} hrs
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                  XP Acquired:
                </span>
                <span className="font-bold text-amber-300">
                  +{hoveredPoint.xpGained} XP
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                  Velocity:
                </span>
                <span className="font-bold text-cyan-300">
                  {hoveredPoint.xpVelocity} XP/hr
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{hoveredPoint.lessonsCompleted} Lessons Mastered</span>
                <span>{hoveredPoint.articlesRead} Reads</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
