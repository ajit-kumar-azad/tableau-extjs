Ext.define('tableau.view.main.Tableau', {
    extend: 'Ext.Panel',

    requires: ['Ext.chart.series.Pie'],

    xtype: 'tableau',

    title: 'Tableau Visual - GDP per-capita',

    items: [{
        xtype : 'toolbar',
        docked: 'top',
        items: [{
            xtype: 'combobox',
            fieldLabel: 'Choose Region',
            triggerAction: 'all',
            store : {
                fields: ['abbr', 'name'],
                data : [
                    {"abbr":"Europe", "name":"Europe"},
                    {"abbr":"Middle East", "name":"Middle East"},
                    {"abbr":"The Americas", "name":"The Americas"},
                    {"abbr":"Oceania", "name":"Oceania"},
                    {"abbr":"Asia", "name":"Asia"},
                    {"abbr":"Africa", "name":"Africa"}
                ]
            },
            value: 'Europe',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbr'
        }]
    }, {
        xtype: 'container',
        layout: 'hbox',
        items: [{
            xtype: 'component',
            flex: 1,
            html: '<div id="tableauViz" style="height:1200px; width:1200px"></div>'
        }, {
           xtype: 'polar',
           renderTo: document.body,
           width: 400,
           height: 400,
           insetPadding: 10,
           innerPadding: 10,
           interactions: ['rotate', 'itemhighlight'],
           store: {
               fields: ['name', 'data1'],
               data: [{
                   name: 'Europe',
                   data1: 14
               }]
           },
           series: {
               type: 'pie',
               highlight: true,
               angleField: 'data1',
               label: {
                   field: 'name',
                   display: 'rotate'
               },
               donut: 30
           }
        }]
    }],

    viz: null,
    workbook: null,
    activeSheet: null,

    filterSingleValue: function(cmp, newVal) {
        this.activeSheet.applyFilterAsync(
        "Region",
        newVal,
        tableauSoftware.FilterUpdateType.REPLACE);
    },

    afterRender: function() {

        this.callParent();

        var cbx = this.down('combobox');
        cbx.on('change', this.filterSingleValue, this);

        var me = this;

        //Get the region filter to be able to apply the filter on the initialisation of the viz
        var placeholderDiv = document.getElementById("tableauViz");
        var url = "http://public.tableausoftware.com/views/WorldIndicators/GDPpercapita?Region=" + cbx.getValue();
        var options = {
            width: "800px",
            height: "400px",
            hideTabs: true,
            hideToolbar: true,
            onFirstInteractive: function () {
                me.workbook = me.viz.getWorkbook();
                me.activeSheet = me.workbook.getActiveSheet();
            }
        };
        me.viz = new tableauSoftware.Viz(placeholderDiv, url, options);
        

        me.viz.addEventListener('filterchange', function(e) {
            e.getFilterAsync().then(function(filter) {
                console.log('Filters are: ', filter.getAppliedValues());
                var vizFilters = filter.getAppliedValues();
                var store = me.down('polar').getStore();
                store.removeAll(true);

                var l = vizFilters.length;
                var recs = [];
                for (var i = 0; i < l; i++) {
                    var name = vizFilters[i].value;

                    if (!store.findRecord('name', name)) {
                        recs.push({
                            name: name,
                            data1: 100/l
                        });
                    }
                }
                store.add(recs);
            });
        });
        me.viz.addEventListener('marksselection', function(e) {
            e.getMarksAsync().then(function(marks) {
              var html = [];
              for (var markIndex = 0; markIndex < marks.length; markIndex++) {
                var pairs = marks[markIndex].getPairs();
                html.push("Mark " + markIndex + ":");
                for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
                  var pair = pairs[pairIndex];
                  html.push(pair.fieldName + ": " + pair.formattedValue);
                }
              }
              console.log(html);

            });
        });
    }
});
