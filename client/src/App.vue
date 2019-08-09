<template>
  <div class="container">
    <div v-if="loaded">
      <!-- <line-chart :chartdata="chartdata" :options="options" :styles="myStyles"/> -->
      <Apex :dates="dateSeries" :values="valueSeries" :used="usedSeries"/>
      <select name="range" id="range" v-model="range" @change="onchange()">
        <option value="year">Year</option>
        <option value="month">Month</option>
        <option value="week">Week</option>
        <option value="day">Day</option>
      </select>
      <button @click="next">Next</button>
      <button @click="prev">previous</button>
    </div>
  </div>
</template>

<script>
import datefns from "date-fns";
import Apex from "./components/apex";

const multisplice = (array, indexes) => {
  return indexes.map(el => {
    return array[el];
  });
};
export default {
  name: "ChartContainer",
  components: {
    Apex
  },

  data: () => ({
    loaded: false,
    range: "week",
    rangePos: 0,
    values: [],
    dataset: [],
    dates: [],
    chartdata: null,
    last: null
  }),
  async mounted() {
    this.loaded = false;
    fetch("/balances")
      .then(response => response.json())
      .then(data => {
        data.map(d => {
          this.dates.push(d.created_at);
          this.values.push(d.remain);
        });
        // this.datasets = [
        //   {
        //     label: "Data Usage",
        //     data: this.data
        //   }
        // ];
        // this.chartdata = {
        //   labels: this.labels,
        //   datasets: this.datasets
        // };
        this.loaded = true;
        // this.updateSeries();
      })
      .catch(error => {
        console.log(error);
      });
  },
  computed: {
    myStyles() {
      return {
        height: `${this.height}px`,
        position: "relative"
      };
    },
    dateSeries() {
      return multisplice(this.dates, this.series).map(rawDate => {
        switch (this.range) {
          case "week":
            return datefns.format(datefns.parse(rawDate), "ddd, MMM Do");
          case "day":
            return datefns.format(datefns.parse(rawDate), "MMM Do, H:mm");
          case "year":
            return datefns.format(datefns.parse(rawDate), "MMM YY'");
          case "month":
            return datefns.format(datefns.parse(rawDate), "MMM Do");
          default:
            return datefns.format(datefns.parse(rawDate), "MMM Do, H:mm");
        }
      });
    },
    usedSeries() {
      return this.valueSeries.map((value, i) => i < this.valueSeries.length - 1
          ? this.valueSeries[i] - this.valueSeries[i + 1]
          : this.valueSeries[i] - this.values[this.last]
      );
    },
    valueSeries() {
      return multisplice(this.values, this.series);
    },
    series() {
      let indexes = [];
      let last = null;
      // if (datefns.isSameYear(currPeriod,this.rangePos), date) < 1) {
      //   if (indexes.length > 0) {
      //     if (
      //       !datefns.isSameMonth(
      //         date,
      //         datefns.parse(dates[indexes[indexes.length - 1]])
      //       )
      //     ) {
      //       indexes.push(i);
      //     }
      //   } else {
      //     indexes.push(i);
      //   }
      // }

      this.dates.map((rawDate, i) => {
        let date = datefns.parse(rawDate);
        switch (this.range) {
          case "year":
            if (
              datefns.differenceInYears(
                datefns.subYears(datefns.startOfToday(), this.rangePos),
                date
              ) == 0
            ) {
              if (indexes.length > 0) {
                if (
                  !datefns.isSameMonth(
                    date,
                    datefns.parse(this.dates[indexes[indexes.length - 1]])
                  )
                ) {
                  indexes.push(i);
                }
              } else {
                indexes.push(i);
              }
            }
            break;
          case "month":
            if (
              datefns.differenceInMonths(
                datefns.subMonths(datefns.startOfToday(), this.rangePos),
                date
              ) == 0
            ) {
              if (indexes.length > 0 && indexes.length < 3) {
                if (
                  !datefns.isSameWeek(
                    date,
                    datefns.parse(this.dates[indexes[indexes.length - 1]])
                  )
                ) {
                  indexes.push(i);
                }
              } else if (indexes.length == 0) {
                indexes.push(i);
              }
              else if (indexes.length == 3 && last == null)
                if (
                  !datefns.isSameWeek(
                    date,
                    datefns.parse(this.dates[indexes[indexes.length - 1]])
                  ) || i == this.dates.length - 1
                ) {
                  last = i;
                }
            }
            break;
          case "week":
            if (
              datefns.differenceInWeeks(
                datefns.subWeeks(datefns.endOfToday(), this.rangePos),
                date
              ) == 0
            ) {
              if (indexes.length > 0 && indexes.length < 7) {
                if (
                  !datefns.isSameDay(
                    date,
                    datefns.parse(this.dates[indexes[indexes.length - 1]])
                  )
                ) {
                  indexes.push(i);
                }
              } else if (indexes.length == 0) {
                indexes.push(i);
              } else if (indexes.length == 7 && last == null)
                if (
                  !datefns.isSameDay(
                    date,
                    datefns.parse(this.dates[indexes[indexes.length - 1]])
                  ) || i == this.dates.length - 1
                ) {
                  last = i;
                }
            }
            break;
          case "day":
            if (
              datefns.differenceInDays(
                datefns.subDays(datefns.startOfToday(), this.rangePos),
                date
              ) == 0
            ) {
              indexes.push(i);
            }
            break;
          default:
            break;
        }
      });
      this.last = last
      return indexes;
    }
  },
  methods: {
    onchange: function() {
      console.log(this.range);
    },
    next: function() {
      this.rangePos++;
    },
    prev: function() {
      if (this.rangePos > 0) this.rangePos--;
    }
  }
};
</script>