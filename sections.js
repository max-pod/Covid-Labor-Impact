let dataset, svg
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend
let deltaUnemploymentXScale, deltaUnemploymentYScale

const margin = { left: 50, top: 50, bottom: 50, right: 20 }
const width = 800 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation

d3.csv('maxdata/economictracker/data/Employment Combined - National - Daily.csv', function (d) {
    let date = new Date();
    date.setUTCFullYear(d.year);
    date.setUTCMonth(d.month);
    date.setUTCDate(d.day);

    return {
        Year: d.year,
        Month: +d.month,
        Day: +d.day,
        Date: date,
        Emp_combined: +d.emp_combined,
        Emp_combined_inclow: +d.emp_combined_inclow,
        Emp_combined_incmiddle: +d.emp_combined_incmiddle,
        Emp_combined_inchigh: +d.emp_combined_inchigh,
        Emp_combined_ss40: +d.emp_combined_ss40,
        Emp_combined_ss60: +d.emp_combined_ss60,
        Emp_combined_ss65: +d.emp_combined_ss65,
        Emp_combined_ss70: +d.emp_combined_ss70,
        Emp_combined_inclow_advance: +d.emp_combined_inclow_advance,
    };
}).then(data => {
    dataset = data
    //console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})

const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e', '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']

//Create all the scales and save to global variables

function createScales() {
    console.log("createScaled Called");
    deltaUnemploymentXScale = d3.scaleTime()
        .domain(d3.extent(dataset, (d) => { return d.Date }))
        .range([0, width]);
    deltaUnemploymentYScale = d3.scaleLinear()
        .domain([-.25, .05])
        .range([margin.top / 4 + height, margin.top / 4]);

}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial() {
    console.log("initial draw")
    //createSizeLegend()
    //createSizeLegend2()

    let svg = d3.select("#vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required
    simulation = d3.forceSimulation(dataset)

    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
    simulation.stop()
    draw1();
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean() {
    let svg = d3.select('#vis').select('svg').select('g').remove();
}

function draw1() {
    console.log("Drawing Line Chart of Unemployment");
    clean('isFirst')
    let x = deltaUnemploymentXScale;
    let y = deltaUnemploymentYScale;
    let svg = d3.select('#vis').select('svg').append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    let title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 4)
        .text("Percentage Change Unemployment")
        .attr("class", "h1")
        .attr("text-anchor", "middle")

    //xAxis
    let xAxisGenerator = d3.axisBottom(deltaUnemploymentXScale)
        .ticks(d3.timeMonth.every(2))
        .tickFormat(d3.timeFormat("%b %e"))

    let xAxis = svg.append("g")
        .attr("transform", `translate(${0},${height + 20})`)
        .call(xAxisGenerator)

    let xDomain = xAxis.select(".domain")
        .remove();

    let xText = xAxis.selectAll("text")
        .attr("opacity", ".6")
        .style("font-size", "12px")

    //yAxis
    let yAxisGenerator = d3.axisLeft(deltaUnemploymentYScale)
        .ticks(7)
        .tickFormat(d3.format(",.0%"))
        .tickSize(-width)

    let yAxis = svg.append("g")
        .call(yAxisGenerator);

    let yDomain = yAxis.select(".domain")
        .attr("stroke-width", "1")
        .attr("opacity", ".6")
        .attr("stroke-dasharray", "4")

    let yTicks = yAxis.selectAll(".tick").select("line")
        .attr("stroke-width", "1")
        .attr("opacity", ".3")
        .attr("stroke-dasharray", "4")

    let yText = yAxis.selectAll("text")
        .attr("opacity", ".6")
        .style("font-size", "11px")

    //Special Dates
    let sDates = [
        { "Date": new Date("Jan 20, 2020"), text: "First U.S. Covid-19 Case" },
        { "Date": new Date("Mar 13, 2020"), text: "National Emergency Declared" },
        { "Date": new Date("March 13, 2020"), text: "CARES Act Enacted" },
        { "Date": new Date("March 13, 2020"), text: "Stimulus Payments Start" },
    ]

    let formatDate = d3.timeFormat("%b %d");
    let formatPercent = d3.format(".1%");

    //THE GRAPH JESUS CHRIST WHY IS IT SO COMPLICATED TO DO IN D3
    svg.append("path")
        .datum(dataset.filter((d) => {
            return d.Emp_combined;
        }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(function (d) {
                //console.log(deltaUnemploymentXScale(d.Date))
                //console.log(d.Date);
                return deltaUnemploymentXScale(d.Date);
            })
            .y(function (d) {
                //console.log(deltaUnemploymentYScale(d.Emp_combined))
                //console.log(d.Emp_combined)
                return deltaUnemploymentYScale(d.Emp_combined)
            })
        )

    // This allows to find the closest X index of the mouse:
    let bisectDate = d3.bisector(function(d) { return d.Date; }).left;

    // Create the circle that travels along the curve of chart
    let focus = svg.append('g')
        .style("display", "none");

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", 10);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y")
        .style("fill", "white")
        .style("stroke", "black")
        .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");

    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () { focus.style("display", null); })
        .on("mouseout", function () { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        let x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(dataset, x0, 1),
            // d0 = dataset[i - 1],
            // d1 = dataset[i],
            d = dataset[i]

        if (i>= 197) {
            return;
        }

        console.log(x0,i);

        focus.select("circle.y")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")");

        focus.select("text.y1")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")")
            .text(formatPercent(d.Emp_combined));

        focus.select("text.y2")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")")
            .text(formatPercent(d.Emp_combined));

        focus.select("text.y3")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")")
            .text(formatDate(d.Date));

        focus.select("text.y4")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")")
            .text(formatDate(d.Date));

        focus.select(".x")
            .attr("transform",
                "translate(" + x(d.Date) + "," +
                y(d.Emp_combined) + ")")
            .attr("y2", height + 15 - y(d.Emp_combined));

        focus.select(".y")
            .attr("transform",
                "translate(" + width * -1 + "," +
                y(d.Emp_combined) + ")")
            .attr("x2", width + width);
    }
}

    function draw2() {
        let svg = d3.select("#vis").select('svg')
        clean('none')

    }

    function draw3() {
        let svg = d3.select("#vis").select('svg')
        clean('isMultiples')

    }

    function draw5() {
        let svg = d3.select('#vis').select('svg')
        clean('isMultiples')

    }

    function draw6() {
        let svg = d3.select("#vis").select("svg")
        clean('isScatter')

    }

    function draw7() {
        let svg = d3.select('#vis').select('svg')

        clean('isBubble')

    }

    function draw4() {
        let svg = d3.select('#vis').select('svg')
        clean('isHist')
    }

    function draw8() {
        let svg = d3.select('#vis').select('svg')
        clean('none')

    }

    //Array of all the graph functions
    //Will be called from the scroller functionality

    let activationFunctions = [
        draw1,
        draw2,
        draw3,
        draw4,
        draw5,
        draw6,
        draw7,
        draw8
    ]


    //All the scrolling function
    //Will draw a new graph based on the index provided by the scroll
    let scroll = scroller()
        .container(d3.select('#graphic'))
    scroll()

    let lastIndex, activeIndex = 0

    scroll.on('active', function (index) {
        d3.selectAll('.step')
            .transition().duration(500)
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        activeIndex = index
        let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(i => {
            activationFunctions[i]();
        })
        lastIndex = activeIndex;

    })

    scroll.on('progress', function (index, progress) {
        if (index == 2 & progress > 0.7) {

        }
    })