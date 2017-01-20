Ext.define('tableau.view.tableau.Tableau', {
    extend: 'Ext.Component',

    xtype: 'tableauviz',

    privates: {
      viz: null,
      workbook: null,
      activeSheet: null
    },

    config: {
      regionFilterTxt: '',
      vizUrl: '',
      options: {
            width: "800px",
            height: "400px",
            hideTabs: true,
            hideToolbar: true
      }
    },

    updateRegionFilterTxt: function(newVal, oldVal) {
      if (this.activeSheet) {
        this.activeSheet.applyFilterAsync(
        "Region",
        newVal,
        (newVal !== "") ? tableauSoftware.FilterUpdateType.REPLACE : tableauSoftware.FilterUpdateType.ALL);
      }
    },

    afterRender: function() {

        this.callParent();

        var me = this;

        var placeholderDiv = me.getEl().dom;
        var url = this.getVizUrl();

        var options = Ext.apply(this.getOptions() , {
            onFirstInteractive: function () {
                me.workbook = me.viz.getWorkbook();
                me.activeSheet = me.workbook.getActiveSheet();

                //set the filter if anything was set by the other part 
                //of the application while the viz wasn't ready
                me.updateRegionFilterTxt(me.getRegionFilterTxt());
            }
        });

        me.viz = new tableauSoftware.Viz(placeholderDiv, url, this.getOptions());
        

        me.viz.addEventListener('filterchange', function(e) {
            e.getFilterAsync().then(function(filter) {
                me.fireEvent('filterchanged', me, filter.getAppliedValues());

            });
        });
        me.viz.addEventListener('marksselection', function(e) {
            e.getMarksAsync().then(function(marks) {
              var retData = [];
              for (var markIndex = 0; markIndex < marks.length; markIndex++) {
                var pairs = marks[markIndex].getPairs();
                
                retData[markIndex] = [];

                for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
                  var pair = pairs[pairIndex];
                  retData[markIndex].push({
                    fieldName: pair.fieldName,
                    formattedValue: pair.formattedValue});
                }
              }
              me.fireEvent('marksselected', me, retData);
            });
        });
    }
});
