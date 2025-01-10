<script lang="ts">
  import { onMount } from "svelte";
  import ApexCharts from "apexcharts";
  import { wsService } from "../services/websocketService";
  import { HEART_RATE_CHART_COLORS as CHART_COLORS} from "../utils";

  let chart: ApexCharts | undefined;
  let chartElement: HTMLElement;
  let bpm = 0;
  let signalQuality = 0;
  let hasFingerContact = false;
  let isMeasuring = false;
  
  const INITIAL_DATA_POINTS = 30;
  let dataPoints = Array(INITIAL_DATA_POINTS).fill(0);
  
  const UPDATE_INTERVAL_MS = 25; 
  let lastUpdateTime = Date.now();
  
  let yAxisMin = 40;
  let yAxisMax = 80;
  const Y_AXIS_PADDING = 5;
  
  const chartOptions = {
    chart: {
      type: "line",
      height: 300,
      animations: { enabled: false },
      toolbar: { show: false },
      background: "#1a1a1a",
      redrawOnWindowResize: false,
      zoom: { enabled: false }, 
      pan: { enabled: false }
    },
    stroke: {
      curve: "straight", 
      width: 2,
      colors: [CHART_COLORS.active],
    },
    series: [{
      name: "Heart Rate",
      data: dataPoints,
    }],
    xaxis: {
      range: INITIAL_DATA_POINTS,
      labels: { show: false },
    },
    yaxis: {
      min: yAxisMin,
      max: yAxisMax,
      tickAmount: 7,
      labels: {
        style: { colors: "#fff" },
        formatter: (value: number) => value.toFixed(0),
      },
    },
    grid: {
      borderColor: "#333",
      strokeDashArray: 5,
    },
    tooltip: { enabled: false },
    theme: { mode: "dark" },
  };

  let dataBuffer: number[] = [];
  const BUFFER_SIZE = 5;
  const BUFFER_INTERVAL = 100;

  function processBuffer() {
    if (dataBuffer.length === 0) return;
    const avgValue = dataBuffer.reduce((sum, val) => sum + val, 0) / dataBuffer.length;
    updateChart(avgValue);
    dataBuffer = [];
  }

  function updateChart(newValue: number) {
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_INTERVAL_MS) return;
    lastUpdateTime = now;

    if (newValue < yAxisMin + Y_AXIS_PADDING || newValue > yAxisMax - Y_AXIS_PADDING) {
      yAxisMin = Math.max(40, Math.min(...dataPoints, newValue) - Y_AXIS_PADDING);
      yAxisMax = Math.min(180, Math.max(...dataPoints, newValue) + Y_AXIS_PADDING);
      chart?.updateOptions({
        yaxis: {
          min: yAxisMin,
          max: yAxisMax,
          tickAmount: 7,
          labels: {
            style: { colors: "#fff" },
            formatter: (value: number) => value.toFixed(0),
          },
        }
      });
    }

    dataPoints = [...dataPoints.slice(1), newValue];
    
    chart?.appendData([{
      data: [newValue]
    }]);
  }

  function updateChartColor(color: string) {
    chart?.updateOptions({
      stroke: {
        colors: [color]
      }
    });
  }

  onMount(() => {
    chart = new ApexCharts(chartElement, chartOptions);
    chart.render();

    const bufferInterval = setInterval(processBuffer, BUFFER_INTERVAL);

    const unsubscribe = wsService.subscribe((data) => {
      if ("status" in data) {
        if (data.status === "no_finger") {
          hasFingerContact = false;
          isMeasuring = false;
          updateChartColor(CHART_COLORS.noFinger);
          return;
        } else if (data.status === "measuring") {
          hasFingerContact = true;
          isMeasuring = true;
          updateChartColor(CHART_COLORS.measuring);
          return;
        }
      }
      if (!("hr" in data) || !("hrQuality" in data)) return;
      hasFingerContact = true;
      isMeasuring = false;
      updateChartColor(CHART_COLORS.active);
      const newBpm = Math.round(data.hr * 10) / 10;
      signalQuality = data.hrQuality;

      if (newBpm >= 40 && newBpm <= 180) {
        bpm = newBpm;
        dataBuffer.push(newBpm);
        if (dataBuffer.length >= BUFFER_SIZE) {
          processBuffer();
        }
      }
    });

    return () => {
      clearInterval(bufferInterval);
      unsubscribe();
      if (chart) {
        chart.destroy();
        chart = undefined;
      }
    };
  });
</script>

<div class="heart-rate-monitor">
  <div class="monitor-header">
    <h2>Heart Rate Monitor</h2>
    <div class="stats">
      {#if !hasFingerContact}
        <span class="no-signal">No Finger Detected</span>
        <span class="hint">Please place your finger on the sensor</span>
      {:else if isMeasuring}
        <span class="measuring">Measuring...</span>
        <span class="hint">Please keep your finger still</span>
      {:else}
        <span class="bpm">{bpm} BPM</span>
        <span class="quality">Signal: {Math.round(signalQuality * 100)}%</span>
      {/if}
    </div>
  </div>
  <div bind:this={chartElement}></div>
</div>

<style>
  .heart-rate-monitor {
    padding: 20px;
    background: #1a1a1a;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  }

  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: #fff;
  }

  .stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .bpm {
    font-size: 1.5em;
    color: #00ff00;
    font-weight: bold;
  }

  .quality {
    font-size: 0.8em;
    opacity: 0.7;
    color: #fff;
  }

  .no-signal {
    font-size: 1.2em;
    color: #ff4444;
    font-weight: bold;
  }

  .measuring {
    font-size: 1.2em;
    color: #ffa500;
    font-weight: bold;
  }

  .hint {
    font-size: 0.8em;
    color: #888;
    margin-top: 4px;
  }

  h2 {
    margin: 0;
    color: #fff;
  }

  :global(.apexcharts-canvas) {
    background: #1a1a1a !important;
  }
</style>
