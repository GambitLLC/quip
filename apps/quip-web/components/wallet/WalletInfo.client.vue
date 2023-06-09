<script setup lang="ts">
import Chart from 'chart.js/auto';
import { watchOnce } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const ticker = useTicker();
const canvasRef = ref<HTMLCanvasElement | null>(null);

watchOnce(canvasRef, (newCanvasRef) => {
  if (newCanvasRef === null || ticker.klines.value === null) return;

  const labels = ticker.klines.value.map((kline) => {
    const date = new Date(kline.openTime);
    //return the date as an am or pm time
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
      minute: 'numeric',
      day: '2-digit',
      month: '2-digit',
    });
  });

  const priceData = ticker.klines.value.map((kline) => {
    return kline.closePrice;
  });

  console.log('new chart');

  //duplicate the first and last values to make the graph look better
  // priceData.unshift(priceData[0])
  // priceData.push(priceData[priceData.length - 1])
  // labels.unshift(labels[0])
  // labels.push(labels[labels.length - 1])

  const chart = new Chart(newCanvasRef, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Solana',
          data: priceData,
          fill: false,
          borderColor: 'rgb(174, 80, 253)',
        },
      ],
    },
    options: {
      interaction: {
        mode: 'x'
      },
      elements: {
        point: {
          pointStyle: false,
          hitRadius: 800,
        },
        line: {
          cubicInterpolationMode: 'monotone',
          borderWidth: 4,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          // external: function (context) {
          //   const price = Number((context.tooltip.body[1].lines[0]).split(" ")[1])
          //   console.log(context.tooltip)
          //
          //   let tooltipEl = document.getElementById('chartjs-tooltip');
          //
          //   // Create element on first render
          //   if (!tooltipEl) {
          //     tooltipEl = document.createElement('div');
          //     tooltipEl.classList.add('tooltipChart');
          //     tooltipEl.id = 'chartjs-tooltip';
          //     tooltipEl.innerHTML = '<table></table>';
          //     document.body.appendChild(tooltipEl);
          //   }
          //
          //   // Hide if no tooltip
          //   const tooltipModel = context.tooltip;
          //   if (tooltipModel.opacity === 0) {
          //     console.log("hide")
          //     tooltipEl.style.opacity = "0";
          //     return;
          //   }
          //
          //   // Set caret Position
          //   tooltipEl.classList.remove('above', 'below', 'no-transform');
          //   if (tooltipModel.yAlign) {
          //     tooltipEl.classList.add(tooltipModel.yAlign);
          //   } else {
          //     tooltipEl.classList.add('no-transform');
          //   }
          //
          //   function getBody(bodyItem) {
          //     return bodyItem.lines;
          //   }
          //
          //   // Set Text
          //   if (tooltipModel.body) {
          //     const titleLines = tooltipModel.title || [];
          //     const bodyLines = tooltipModel.body.map(getBody);
          //
          //     let innerHtml = '<thead>';
          //
          //     titleLines.forEach(function(title) {
          //       innerHtml += '<tr><th>' + title + '</th></tr>';
          //     });
          //     innerHtml += '</thead><tbody>';
          //
          //     bodyLines.forEach(function(body, i) {
          //       if (i > 0) return
          //       const span = '<span>$' + price.toFixed(2) + '</span>';
          //       innerHtml += '<tr><td>' + span + '</td></tr>';
          //     });
          //     innerHtml += '</tbody>';
          //
          //     let tableRoot = tooltipEl.querySelector('table');
          //     if (tableRoot) tableRoot.innerHTML = innerHtml;
          //   }
          //
          //   const position = context.chart.canvas.getBoundingClientRect();
          //
          //   // Display, position, and set styles for font
          //   tooltipEl.style.opacity = "1";
          //   tooltipEl.style.position = 'absolute';
          //   tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          //   tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          //   tooltipEl.style.font = 'co-headline';
          //   tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
          //   tooltipEl.style.pointerEvents = 'none';
          // },
        },
      },
      scales: {
        y: {
          display: false,
        },
        x: {
          display: false,
        },
      },
    },
  });
});

const currentPrice = computed(() => {
  if (ticker.klines.value === null) return 'Loading...';
  return `${ticker.klines.value[
    ticker.klines.value.length - 1
  ].closePrice.toFixed(2)} USD`;
});

const deltaChange = computed(() => {
  if (ticker.klines.value === null) return 'Loading...';
  const firstPrice = ticker.klines.value[0].closePrice;
  const lastPrice =
    ticker.klines.value[ticker.klines.value.length - 1].closePrice;
  const delta = lastPrice - firstPrice;
  const percentChange = (delta / firstPrice) * 100;
  return `${delta.toFixed(2)} (${percentChange.toFixed(2)}%)`;
});

const deltaChangeIcon = computed(() => {
  if (ticker.klines.value === null) return 'Loading...';
  const firstPrice = ticker.klines.value[0].closePrice;
  const lastPrice =
    ticker.klines.value[ticker.klines.value.length - 1].closePrice;
  const delta = lastPrice - firstPrice;
  if (delta > 0) {
    return 'material-symbols:arrow-upward-rounded';
  } else {
    return 'material-symbols:arrow-downward-rounded';
  }
});
</script>

<template>
  <div class="walletInfo">
    <div class="canvasPosition">
      <div class="info">
        <div class="d-flex align-center mr-4">
          <Icon class="usdIcon text-primary" icon="fa:usd" />
          <h3 class="infoText text-primary">{{ currentPrice }}</h3>
        </div>
        <div class="d-flex align-center">
          <Icon class="text-primary deltaIcon mr-2" :icon="deltaChangeIcon" />
          <h3 class="infoText text-primary">{{ deltaChange }}</h3>
        </div>
      </div>
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.walletInfo {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.usdIcon {
  width: 14px;
  height: 14px;
  margin-right: -1px;
}

.deltaIcon {
  font-size: 18px;
}

.info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.infoText {
  font-size: 16px;
  letter-spacing: 1.2px;
}

.canvasPosition {
  position: relative;
  left: -24px;
  width: calc(100% + 48px);
  height: 100%;
  overflow: hidden;
}

canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0px;
}
</style>

<style lang="scss">
.tooltipChart {
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.8);

  border-radius: 4px;
  padding: 4px 8px;
  font-family: "co-headline";

  //transform: translateY(-50px);

  table {
    thead {
      tr {
        th {
          color: white;
          font-size: 12px;
        }
      }
    }

    tbody {
      tr {
        td {
          span {
            color: white;
            background: none !important;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
