function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;

    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

//1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples_data = data.samples;


    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var filtered_samples = samples_data.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var filtered_samples_array = filtered_samples[0]

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.

    var otu_ids = filtered_samples_array.otu_ids;
    var otu_labels = filtered_samples_array.otu_labels;
    var sample_values = filtered_samples_array.sample_values;

    // console.log("otu_ids:",otu_ids);
    // console.log("otu_labels:",otu_labels);
    // console.log("sample_values:",sample_values);


    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var sorted_otu_id = otu_ids.sort((a, b) => b.otu_ids - a.otu_ids);
    var top10_otu_ids = sorted_otu_id.slice(0, 10).reverse();

    var sorted_sample_values = sample_values.sort((a, b) => b.sample_values - a.sample_values);
    var top10_sample_values = sorted_sample_values.slice(0, 10).reverse();

    var sorted_otu_labels = otu_labels.sort((a, b) => b.otu_labels - a.otu_labels);
    var top10_otu_labels = sorted_otu_labels.slice(0, 10).reverse()

    //console.log("sorted_otu_id:" , sorted_otu_id);
    //console.log("top10_otu_ids:",top10_otu_ids);
    //console.log("sorted_otu_id:" , sorted_sample_values);
    //console.log("top10_sample_values:",top10_sample_values);

    /*---------------------------------------- HBAR GRAPH ----------------------------------------*/
    var yticks = top10_otu_ids.map(otu_id => "UTD" + otu_id)
    var trace = {
      x: top10_sample_values,
      y: yticks,
      type: "bar",
      orientation: 'h',
      hovertext: top10_otu_labels,
      marker:{
        line: {
        color: 'rgb(8,48,107)',
        width: 1.5
       }
      }
    }


    // // 8. Create the trace for the bar chart. 
    var barData = [trace];
    // // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      hovermode: 'closest'
    };
    // 10. Use Plotly to plot the data with the layout. 

    // Render the plot to the div tag with id "plot"
    Plotly.newPlot("bar", barData, barLayout,{scrollZoom: true});
    /*---------------------------------------- BUBBLE CHART ----------------------------------------*/

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: otu_ids,
        colorscale: 'Earth'
      },
      type: 'scatter',
      hovertext: otu_labels

    }


    ];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures per Sample',

      showlegend: false,
      height: 500,
      width: 1000,
      hovermode: "closest",
      xaxis: {
        title: {
          text: 'OTU ID'
        },
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout,{scrollZoom: true});

    /*---------------------------------------- GAUGE CHART ----------------------------------------*/

    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    // Create a variable that holds the first sample in the array.
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    // 2. Create a variable that holds the first sample in the metadata array.  
    var result = resultArray[0];

    // 3. Create a variable that holds the washing frequency.
    var wfreq = parseFloat(result.wfreq);
    // 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: wfreq,
        title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [0, 10] },
          bar: { color: "black" },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "yellowgreen" },
            { range: [8, 10], color: "darkgreen" }
          ]
        }
      }
    ];

    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      width: 470,
      height: 450,
      margin: { t: 20, r: 20, l: 20, b: 20 },
      paper_bgcolor: "#DAEAF1",
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout,{scrollZoom: true});

  });


}

