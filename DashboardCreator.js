DashboardCreater = function (parent, config) {
    var me = this;
    var title = "Dashboard Creator";
    var editor;
    var modal;
    var defaultConfig = {
        style: {},
    };
    var previewChart;
    //**************************************************************************
    //** Constructor
    //**************************************************************************
    var init = function () {
        var div = document.createElement("div");
        let header = document.createElement("header");
        header.innerHTML = `<h2>${title}</h2>`;
        div.append(header);

        let wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        div.append(wrapper);

        let leftColumn = document.createElement("div");
        leftColumn.className = "col";

        let drawFlow = document.createElement("div");
        drawFlow.id = "drawflow";
        drawFlow.ondrop = drop;
        drawFlow.ondragover = allowDrop;

        let previewArea = document.createElement("div");
        previewArea.style.width = 100 + "%";
        previewArea.style.height = 300 + "px";
        previewArea.id = "Viz_area";
        previewArea.className = "drag-drawflow";
        previewArea.style.padding = 0;

        let tableNode = createNode("chartType", "chart-bar", "Chart Type");
        let graphNode = createNode("axis", "chart-bar", "Graph");

        leftColumn.appendChild(previewArea);
        leftColumn.appendChild(tableNode);
        leftColumn.appendChild(graphNode);

        wrapper.appendChild(leftColumn);
        wrapper.appendChild(drawFlow);
        parent.appendChild(div);
        createDrawFlowEnvironment();
        createModal(parent);

        createPreviewChart(previewArea);
    };

    const nodeCreated = (id) => {
        console.log(editor.getNodeFromId(id));
        let node = editor.getNodeFromId(id);
        let nodeName = node.name;
        switch (nodeName) {
            case "chartType":
                let chartType = node.data.chartType;
                updateChart(null, {
                    name: "chartType",
                    value: chartType,
                });
                break;
            case "axis":
                let xKey = node.data.option.xAxis;
                let yKey = node.data.option.yAxis;
                updateChart(null, {
                    name: "xAxis",
                    value: xKey,
                });
                updateChart(null, {
                    name: "yAxis",
                    value: yKey,
                });

                break;
            default:
        }
    };

    const updateChart = (event, check) => {
        let { name, value } = event ? event.target : check;

        switch (name) {
            case "chartType":
                previewChart.updateChartType(value);
                break;
            case "xAxis":
                previewChart.updateAxis(name, value);
                break;
            case "yAxis":
                previewChart.updateAxis(name, value);
                break;

            default:
                break;
        }
        previewChart.refresh();
    };

    var createPreviewChart = (element) => {
        let dataOptions = {
            data1: [
                { time:"2016-1-1",country: "United States", value: 120 },
                { time:"2016-2-1",country: "Russia", value: 6155 },
                { time:"2016-4-1",country: "France", value: 2162 },
                { time:"2016-3-1",country: "Germany", value: 1653 },
                { time:"2016-5-1",country: "United Kingdom", value: 1214 },
                { time:"2016-6-1",country: "China", value: 1131 },
                { time:"2016-7-1",country: "Spain", value: 814 },
                { time:"2016-8-1",country: "Netherlands", value: 1167 },
                { time:"2016-9-1",country: "Italy", value: 660 },
                { time:"2016-10-1",country: "Israel", value: 1263 },
            ],
            data2: [
                { time: "United States", value: 12 },
                { time: "Russia", value: 6148 },
                { time: "Germany", value: 1653 },
                { time: "France", value: 2162 },
                { time: "United Kingdom", value: 1214 },
                { time: "Italy", value: 660 },
                { time: "Israel", value: 1263 },
            ],
        };
        let opts = {
            element,
            data: dataOptions.data1,
        };

        previewChart = new Chart(opts);
    };

    var createModal = (mountingPoint) => {
        modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "none";

        div = document.createElement("div");
        div.className = "modal-content";

        let close = document.createElement("span");
        close.className = "close";
        close.onclick = closemodal;
        close.innerHTML = `           
        <span class="close">&times;</span>
        `;

        let content = document.createElement("div");
        content.innerHTML = `
        Change your letiable {name} !
        <input type="text" df-name></input>`;

        div.appendChild(close);
        div.appendChild(content);
        modal.appendChild(div);
        mountingPoint.appendChild(modal);
    };

    var createDrawFlowEnvironment = () => {
        let id = document.getElementById("drawflow");
        editor = new Drawflow(id);
        editor.reroute = true;
        editor.start();

        editor.on("nodeCreated", function (id) {
            nodeCreated(id);
            console.log("Node created " + id);
        });
    };

    var createNode = (nodeName, faName, title) => {
        node = document.createElement("div");
        node.className = "drag-drawflow";
        node.draggable = "true";
        node.ondragstart = drag;
        node.dataset["node"] = nodeName;
        node.innerHTML = ` <i class="fas fa-${faName}"></i><span> ${title}</span>`;
        return node;
    };

    function drag(ev) {
        if (ev.type === "touchstart") {
            mobile_item_selec = ev.target
                .closest(".drag-drawflow")
                .getAttribute("data-node");
        } else {
            ev.dataTransfer.setData(
                "node",
                ev.target.getAttribute("data-node")
            );
        }
    }

    function drop(ev) {
        if (ev.type === "touchend") {
            let parentdrawflow = document
                .elementFromPoint(
                    mobile_last_move.touches[0].clientX,
                    mobile_last_move.touches[0].clientY
                )
                .closest("#drawflow");
            if (parentdrawflow != null) {
                addNodeToDrawFlow(
                    mobile_item_selec,
                    mobile_last_move.touches[0].clientX,
                    mobile_last_move.touches[0].clientY
                );
            }
            mobile_item_selec = "";
        } else {
            ev.preventDefault();
            let data = ev.dataTransfer.getData("node");
            addNodeToDrawFlow(data, ev.clientX, ev.clientY);
        }
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function addNodeToDrawFlow(name, pos_x, pos_y) {
        if (editor.editor_mode === "fixed") {
            return false;
        }
        pos_x =
            pos_x *
                (editor.precanvas.clientWidth /
                    (editor.precanvas.clientWidth * editor.zoom)) -
            editor.precanvas.getBoundingClientRect().x *
                (editor.precanvas.clientWidth /
                    (editor.precanvas.clientWidth * editor.zoom));
        pos_y =
            pos_y *
                (editor.precanvas.clientHeight /
                    (editor.precanvas.clientHeight * editor.zoom)) -
            editor.precanvas.getBoundingClientRect().y *
                (editor.precanvas.clientHeight /
                    (editor.precanvas.clientHeight * editor.zoom));

        switch (name) {
            case "dbclick":
                let uid = uuidv4();
                let dbclick = `
                <div class="title-box"><i class="fas fa-table"></i> Table Selection</div>
                  <div class="box dbclickbox" id=${uid}>
                    Db Click here
                  </div>
                `;

                editor.addNode(
                    "dbclick",
                    0,
                    1,
                    pos_x,
                    pos_y,
                    "dbclick",
                    { name: "" },
                    dbclick
                );

                let node = document.getElementById(uid);
                node.onclick = showpopup;

                break;
            case "graph":
                let graph = `
                <div class="title-box"><i class="fas fa-chart-bar"></i> Preview </div>
                    <div style = "height:200px; width:100%">
                    <svg id = "preview-chart"></svg>
                    </div>
                `;

                editor.addNode(
                    "graph",
                    1,
                    0,
                    pos_x,
                    pos_y,
                    "graph",
                    { name: "" },
                    graph
                );
                previewChart();
                break;
            case "chartType":
                let chart_uid = uuidv4();
                var chartTypetemplate = `
                        <div>
                            <div class="title-box"> Chart Type</div>
                            <div class="box">
                            <p>Select Graph Type</p>
                            <select df-chartType id =${chart_uid} name = "chartType">
                                <option value="Bar">Bar Chart</option>
                                <option value="Line">Line Chart</option>
                            </select>
                            </div>
                        </div>
                        `;
                editor.addNode(
                    "chartType",
                    1,
                    1,
                    pos_x,
                    pos_y,
                    "chartType",
                    { chartType: "Bar" },
                    chartTypetemplate
                );

                let chartNode = document.getElementById(chart_uid);
                chartNode.onchange = updateChart;

                break;
            case "graphDataOptions":
                let graph_data_uid = uuidv4();
                var graphOptionsTemplate = `
                        <div>
                            <div class="title-box"> Graph Data Selection</div>
                            <div class="box">
                            <p>Select Graph Type</p>
                            <select df-graphDataOptions onchange="updateChart()">
                            ${Object.keys(dataOptions).map((option) => {
                                return `<option value="${option}">${option}</option>`;
                            })}
         
                            </select>
                            </div>
                        </div>
                        `;
                editor.addNode(
                    "graphDataOptions",
                    0,
                    1,
                    pos_x,
                    pos_y,
                    "graphDataOptions",
                    { option: dataOptions[0] },
                    graphOptionsTemplate
                );
                break;
            case "axis":
                let xAxis_uid = uuidv4();
                let yAxis_uid = uuidv4();
                let defaultXKey = previewChart.xKey || previewChart.keys[0];
                let defaultYKey = previewChart.yKey || previewChart.keys[1];
                var axisTemplate = `
                        <div>
                            <div class="title-box"> Data Axis</div>
                            <div class="box">
                            <p> X Axis</p>
                            <select df-axis-xAxis id=${xAxis_uid} name = "xAxis">
                            ${previewChart.keys.map((key) => {
                                return `<option value="${key}">${key}</option>`;
                            })}
                            </select>
                            <p> Y Axis</p>
                            <select df-axis-yAxis id =${yAxis_uid} name = "yAxis">
                            ${previewChart.keys.reverse().map((key) => {
                                return `<option value="${key}">${key}</option>`;
                            })}
         
                            </select>
                            </div>
                        </div>
                        `;
                editor.addNode(
                    "axis",
                    1,
                    1,
                    pos_x,
                    pos_y,
                    "axis",
                    {
                        option: {
                            xAxis: defaultXKey,
                            yAxis: defaultYKey,
                        },
                    },
                    axisTemplate
                );

                let xNode = document.getElementById(xAxis_uid);
                let yNode = document.getElementById(yAxis_uid);
                // xNode.onclick = updateChart
                xNode.onchange = updateChart;
                yNode.onchange = updateChart;

                break;

            default:
                console.log("here");
        }
    }

    //**************************************************************************
    //** Extra Stuff
    //**************************************************************************
    function previewChart() {
        let svgEl = document.getElementById("preview-chart");
        let parent = svgEl.parentElement;
        let width = parent.offsetWidth;
        let height = parent.offsetHeight;
        let svg = d3
            .select(svgEl)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "black");

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "red");
    }

    function showpopup(e) {
        modal.style.display = "block";

        editor.precanvas.style.left = editor.canvas_x + "px";
        editor.precanvas.style.top = editor.canvas_y + "px";
        editor.editor_mode = "fixed";
    }

    function closemodal(e) {
        modal.style.display = "none";

        editor.precanvas.style.left = "0px";
        editor.precanvas.style.top = "0px";
        editor.editor_mode = "edit";
    }

    init();
};
