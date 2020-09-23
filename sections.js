let dataset, svg
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend
let deltaUnemploymentXScale, deltaUnemploymentYScale

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation

d3.csv('maxdata/economictracker/data/Employment Combined - National - Daily.csv', function(d){
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
        Emp_combined_inclow_advance: d.emp_combined_inclow_advance,

    };
}).then(data => {
    dataset = data
    console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})

const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']

//Create all the scales and save to global variables

function createScales(){
    console.log("createScaled Called");
    deltaUnemploymentXScale = d3.scaleTime()
        .domain(d3.extent(dataset, (d) => {
            return d.Date;
        }))
        .range([0,width]);
    deltaUnemploymentYScale = d3.scaleLinear()
        .domain(-.4,.1) 
        .range([margin.top + height, margin.top]);

}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial(){
    console.log("initial draw")
    //createSizeLegend()
    //createSizeLegend2()

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
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    
}

function draw1(){
    console.log("Drawing Line Chart of Unemployment");
    clean('isFirst')
    
    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)

    let xAxis = d3.axisBottom(deltaUnemploymentXScale)
        .ticks(4)
        .tickSize(height + 80)

    
}


function draw2(){
    let svg = d3.select("#vis").select('svg')
    clean('none')

}

function draw3(){
    let svg = d3.select("#vis").select('svg')
    clean('isMultiples')
    
}

function draw5(){
    let svg = d3.select('#vis').select('svg')
    clean('isMultiples')

}

function draw6(){
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')
   
}

function draw7(){
    let svg = d3.select('#vis').select('svg')

    clean('isBubble')

}

function draw4(){
    let svg = d3.select('#vis').select('svg')
    clean('isHist')
}

function draw8(){
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

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})