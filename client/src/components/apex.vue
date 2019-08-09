<template>
  <div>
    <apexchart width="1300" height="400" type="bar" :options="chartOptions()" :series="series()"></apexchart>
  </div>
</template>
<script>
export default {
  props: {
    dates: Array,
    values: Array,
    used: Array
  },
  methods: {
    chartOptions() {
      return {
        chart: {
          stacked: true
        },
        stroke: {
          width: 1,
          colors: ["#fff"]
        },
        title: {
          text: "Data Usage"
        },
        xaxis: {
          categories: this.dates
        },
        dataLabels: {
          formatter: function(val) {
            return val > 1024 ? (val / 1024).toFixed(1) + "GB" : val + "MB";
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return val > 1024 ? (val / 1024).toFixed(1) + "GB" : val + "MB";
            }
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: "top",
          horizontalAlign: "left",
          offsetX: 40
        }
      };
    },
    series() {
      return [
        {
          name: "Remaining",
          data: this.values
        },
        {
          name: "Used",
          data: this.used
        }
      ];
    }
  }
};
</script>
