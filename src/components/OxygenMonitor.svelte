<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { wsService } from "../services/websocketService";
  import type { OxygenLevel } from "../types";
  import { determineStatus, STATUS_COLORS, STATUS_TEXTS } from "../utils";

  let oxygenLevel: OxygenLevel = {
    value: 0,
    status: "normal",
  };
  let hasFingerContact = false;

  onMount(() => {
    const unsubscribe = wsService.subscribe((data) => {
      if ("status" in data && data.status === "no_finger") {
        hasFingerContact = false;
        return;
      }
      if (!("spO2" in data)) return;
      hasFingerContact = true;
      oxygenLevel = {
        value: Math.round(data.spO2 * 10) / 10,
        status: determineStatus(data.spO2),
      };
    });

    return () => {
      unsubscribe();
    };
  });

  $: statusColor = STATUS_COLORS[oxygenLevel.status];
  $: statusText = STATUS_TEXTS[oxygenLevel.status];
</script>

<div class="oxygen-monitor" transition:fade>
  <div class="circle-wrapper">
    <div class="outer-circle" style="border-color: {hasFingerContact ? statusColor : '#ff4444'}">
      <div class="inner-circle">
        {#if hasFingerContact}
          <div class="value-display">
            <span class="value">{oxygenLevel.value}</span>
            <span class="unit">%</span>
          </div>
          <span class="label">SpO₂</span>
          <div class="status" style="color: {statusColor}">
            {statusText}
          </div>
        {:else}
          <div class="no-signal">
            <span class="error-text">No Finger Detected</span>
            <span class="hint">Please place your finger on the sensor</span>
          </div>
        {/if}
      </div>
    </div>
    {#if hasFingerContact}
      <div class="pulse-ring" style="border-color: {statusColor}"></div>
    {/if}
  </div>
</div>

<style>
  .oxygen-monitor {
    padding: 2rem;
    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
    border-radius: 20px;
    box-shadow:
      20px 20px 60px #1a1a1a,
      -20px -20px 60px #2a2a2a;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .circle-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
  }

  .outer-circle {
    position: relative;
    width: 100%;
    height: 100%;
    border: 4px solid;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .inner-circle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    width: 80%;
    height: 80%;
  }

  .value-display {
    display: flex;
    align-items: baseline;
    margin-bottom: 5px;
  }

  .value {
    font-size: 3em;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
  }

  .unit {
    font-size: 1.5em;
    color: #ffffff;
    margin-left: 5px;
    opacity: 0.8;
  }

  .label {
    font-size: 1.2em;
    color: #ffffff;
    opacity: 0.6;
    margin: 5px 0;
  }

  .status {
    font-size: 1em;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .no-signal {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .error-text {
    font-size: 1.5em;
    color: #ff4444;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .hint {
    font-size: 0.9em;
    color: #888;
  }

  .pulse-ring {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 4px solid;
    border-radius: 50%;
    opacity: 0;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    70% {
      transform: scale(1.1);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  .oxygen-monitor:hover .outer-circle {
    transform: scale(1.02);
  }
</style>
