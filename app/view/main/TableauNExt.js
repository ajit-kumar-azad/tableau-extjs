Ext.define('tableau.view.main.TableauNExt', {
    extend: 'Ext.Panel',

    requires: ['Ext.chart.series.Pie',
              'tableau.view.tableau.Tableau'],

    xtype: 'tableaunext',

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
                    {"abbr":"", "name":"All"},
                    {"abbr":"Europe", "name":"Europe"},
                    {"abbr":"Middle East", "name":"Middle East"},
                    {"abbr":"The Americas", "name":"The Americas"},
                    {"abbr":"Oceania", "name":"Oceania"},
                    {"abbr":"Asia", "name":"Asia"},
                    {"abbr":"Africa", "name":"Africa"}
                ]
            },
            value: 'All',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbr'
        }]
    }, {
        xtype: 'container',
        layout: 'hbox',
        items: [{
            xtype: 'tableauviz',
            flex: 1,
            vizUrl: "http://public.tableausoftware.com/views/WorldIndicators/GDPpercapita"
        }, {
           xtype: 'polar',
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

    filterSingleValue: function(cmp, newVal) {
      this.down('tableauviz').setRegionFilterTxt(newVal);
    },

    afterRender: function() {

        this.callParent();

        var cbx = this.down('combobox');
        var viz = this.down('tableauviz');

        cbx.on('change', this.filterSingleValue, this);

        var me = this;

        viz.on('filterchanged', function(cmp, vizFilters) {
            var store = me.down('polar').getStore();
            store.removeAll(true);

            var l = vizFilters.length;
            var recs = [];
            for (var i = 0; i < l; i++) {
                var name = vizFilters[i].value;

                recs.push({
                    name: name,
                    data1: 100/l
                });
            }
            store.add(recs);            
        });

        viz.on('marksselected', function(cmp, marks) {
          console.log('Selected marks: ', marks);
        });

    }
});
