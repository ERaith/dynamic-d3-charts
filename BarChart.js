class Chart {
    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;
        this.svg;
        this.keys = this.getKeys();
        this.xKey;
        this.yKey;
        this.setup();
    }
    getKeys = () => {
        return Object.keys(this.data[0]);
    };

    setup() {
        this.margin = {
            top: 15,
            right: 5,
            bottom: 65,
            left: 82,
        };

        this.width = this.element.offsetWidth;

        this.height = this.element.offsetHeight;

        this.plotHeight = this.height - this.margin.top - this.margin.bottom;
        this.plotWidth = this.width - this.margin.left - this.margin.right;

        this.axisHeight = this.height - this.margin.top - this.margin.bottom;
        this.axisWidth = this.width - this.margin.left - this.margin.right;

        this.element.innerHTML = "";

        this.svg = d3.select(this.element).append("svg");
        this.svg.attr("width", this.width);
        this.svg.attr("height", this.height);

        this.plotArea = this.svg.append("g");

        this.plotArea
            .attr("id", "plotArea")
            .attr("width", this.plotWidth)
            .attr("height", this.plotHeight)
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );

        this.titleSvg = this.svg.append("g").append("text").attr("id", "title");
    }

    refresh() {
        if (this.data && this.xKey && this.yKey) {
            this.addAxis();
        }

        if (this.data && this.chartType && this.x && this.y) {
            this.addPlot();
        }
    }

    updateChartType(chartType) {
        this.chartType = chartType;
    }

    updateAxis(whichAxis, value) {
        switch (whichAxis) {
            case "xAxis":
                this.xKey = value;
                break;
            case "yAxis":
                this.yKey = value;
                break;
            default:
                break;
        }
    }

    updateData(data) {
        this.data = data;
    }

    addTitle(title) {
        this.titleSvg
            .attr("x", "5px")
            .attr("y", "15px")
            .attr("dy", ".35em")
            .text(title);
    }

    typeOfAxisValue(value) {
        let dataType;
        switch (typeof value) {
            case "string":
                dataType = Date.parse(value) ? "date" : "string";
                break;
            case "number":
                dataType = "number";
                break;
            case "object":
                dataType = "date";
                break;
            default:
                break;
        }
        return dataType;
    }

    addAxis() {
        // inputs:
        let xKey = this.xKey;
        let yKey = this.yKey;
        let yMax = 0;
        let xMax = 0;

        let xType = this.typeOfAxisValue(this.data[0][xKey]);
        let yType = this.typeOfAxisValue(this.data[0][yKey]);

        this.data.forEach((val) => {
            if (val[yKey] > yMax) {
                yMax = val[yKey];
            }
        });

        this.data.forEach((val) => {
            if (val[xKey] > xMax) {
                xMax = val[xKey];
            }
        });

        if (xType == "string") {
            this.x = d3
                .scaleBand()
                .domain(
                    this.data.map(function (d) {
                        return d[xKey];
                    })
                )
                .range([0, this.axisWidth])
                .padding(0.2);
        } else if (xType == "date") {
            this.data.map(val=>{
                val[xKey] = new Date(val[xKey])
                return val
            })
            this.x = d3
                .scaleTime()
                .domain([new Date("2016-1-1"), new Date("2016-10-1")])
                .rangeRound([10, this.axisWidth-10])
            this.xBand = d3.scaleBand()
                .domain(d3.timeMonth.range(...this.x.domain()))
                .rangeRound([10,this.axisWidth - 10])
                .padding(0.2)
            this.timeAxis = "x"
        } else {
            this.x = d3
                .scaleLinear()
                .domain([0, xMax])
                .range([0, this.axisWidth])
        }

        if (yType == "string") {
            this.y = d3
                .scaleBand()
                .domain(
                    this.data.map(function (d) {
                        return d[yKey];
                    })
                )
                .range([this.axisHeight, 0])
                .padding(0.2);
        } else if (yType == "date") {
            this.data.map(val=>{
                val[yKey] = new Date(val[yKey])
                return val
            })
            this.y = d3
                .scaleTime()
                .domain([ new Date("2016-1-1"),new Date("2016-10-1")])
                .rangeRound([this.axisHeight - 10,10])
            this.yBand = d3.scaleBand()
                .domain(d3.timeMonth.range(...this.y.domain()))
                .rangeRound([this.axisHeight - 10,10])
                .padding(0.2)
            this.timeAxis = "y"
        } else {
            this.y = d3
                .scaleLinear()
                .domain([0, yMax])
                .range([this.axisHeight, 0])
        }

        d3.select("#xAxis").remove();
        var xAxis = this.svg
            .append("g")
            .attr("id", "xAxis")
            .attr(
                "transform",
                "translate(" +
                    this.margin.left +
                    "," +
                    (this.axisHeight + this.margin.top) +
                    ")"
            )
            .call(d3.axisBottom(this.x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        d3.select("#yAxis").remove();
        var yAxis = this.svg
            .append("g")
            .attr("id", "yAxis")
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            )
            .call(d3.axisLeft(this.y));
    }

    addPlot() {
        // Bars
        let xKey = this.xKey;
        let yKey = this.yKey;
        let x = this.x;
        let y = this.y;
        let height = this.plotHeight;
        let width = this.plotWidth;

        this.plotArea.selectAll("*").remove();

        switch (this.chartType) {
            case "Bar":
                if(y.bandwidth||x.bandwidth){
                    this.plotArea
                        .selectAll("mybar")
                        .data(this.data)
                        .enter()
                        .append("rect")
                        .attr("x", function (d) {
                            return x.bandwidth ? x(d[xKey]) : 0;
                        })
                        .attr("y", function (d) {
                            return y(d[yKey]);
                        })
                        .attr("height", function (d) {
                            return y.bandwidth
                                ? y.bandwidth()
                                : height - y(d[yKey]);
                        })
                        .attr("width", function (d) {
                            return x.bandwidth 
                            ? x.bandwidth()
                            : x(d[xKey])
                        })
                        .attr("fill", "#69b3a2");
                }else {
                    let xBarWidth =   this.xBand.bandwidth()
                    let yBarWidth =  this.yBand.bandwidth()
                    if(this.timeAxis == "x"){

                        this.plotArea
                            .selectAll("mybar")
                            .data(this.data)
                            .enter()
                            .append("rect")
                            .attr("x", function (d) {
                                return x(d[xKey]) - xBarWidth/2
                            })
                            .attr("y", function (d) {
                                return y(d[yKey]);
                            })
                            .attr("height", function (d) {
                                return height - y(d[yKey]);
                            })
                            .attr("width", function (d) {
                                return xBarWidth
                            })
                            .attr("fill", "#69b3a2");
                    }else if(this.timeAxis == "y"){

                        this.plotArea
                            .selectAll("mybar")
                            .data(this.data)
                            .enter()
                            .append("rect")
                            .attr("x", function (d) {
                                return 0
                            })
                            .attr("y", function (d) {
                                return y(d[yKey]) - yBarWidth/2
                            })
                            .attr("height", function (d) {
                                return yBarWidth
                            })
                            .attr("width", function (d) {
                                return x(d[xKey])
                            })
                            .attr("fill", "#69b3a2");
                    }
                }
                // this.plotArea
                //     .selectAll("mybar")
                //     .data(this.data)
                //     .enter()
                //     .append("rect")
                //     .attr("x",0)
                //     .attr("y", function (d) {
                //         return y(d[yKey]);
                //     })
                //     .attr("height", y.bandwidth())
                //     .attr("width", function (d) {
                //         return x(d[xKey]);
                //     })
                //     .attr("fill", "#69b3a2");

                // this.plotArea
                //     .selectAll("mybar")
                //     .data(this.data)
                //     .enter()
                //     .append("rect")
                //     .attr("x", function (d) {
                //         return x(d[xKey]);
                //     })
                //     .attr("y", function (d) {
                //         return y(d[yKey]);
                //     })
                //     .attr("width", x.bandwidth())
                //     .attr("height", function (d) {
                //         return height - y(d[yKey]);
                //     })
                //     .attr("fill", "#69b3a2");

                break;
            case "Line":
                this.plotArea
                    .append("path")
                    .datum(this.data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr(
                        "d",
                        d3
                            .line()
                            .x(function (d) {
                                return x(d[xKey]);
                            })
                            .y(function (d) {
                                return y(d[yKey]);
                            })
                    );
                break;
            default:
                break;
        }
    }

    setColor(newColor) {}
}

const chartValidator = {
    bar: {
        axis: true,
        data: true,
        chartType: true,
    },
    line: {
        axis: true,
        data: true,
        chartType: true,
    },
};
