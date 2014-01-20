/**
 * Created by soto on 1/19/14.
 */
var app = {

    config: {
        doPoll: true,
        grid: '#grid',
        data: null,
        appUrl: 'http://localhost:3000/orders',
        mostOrdered: null
    },

    init: function () {
        console.log("init:app");
        this.poll();
        this.initMap();
    },

    poll: function () {
        console.log("poll:app");
        if (this.config.doPoll) {
            $.get(this.config.appUrl, function (data) {
                app.config.data = data;
                $("#server_error").remove();
                $("#header").html("<h1 class='ui-title' role='heading'>Feed.me Orders</h1>");
                var html = '',
                    ind = 0,
                    col = '';
                $.each(data, function (i, el) {
                    if (!el.hasOwnProperty('name')) {
                        el.name = "Order has no name, verify !";
                    }
                    switch (ind) {
                        case 0:
                            col = 'a'
                            break;
                        case 1:
                            col = 'b'
                            break;
                        case 2:
                            col = 'c'
                            break;
                        case 3:
                            col = 'd'
                            ind = 0;
                            break;
                    }
                    html += '<div class="ui-block-' + col + '"><a href="#popupMap" style="height:4em" id="order_' + el.id + '" data-rel="popup" data-transition="slideup" class="ui-btn">Order ID: #' + el.id + '</a></div>';
                    $(document).on('click', '#order_' + el.id, function () {
                        app.show(el);
                    });
                    ind++;
                });
                $(app.config.grid).html(html);
                var mo = app.getMostOrdered();
                $('#main_most').html('<h1>'+mo.mostOrdered+'</h1>');
            })
                .fail(function () {
                    console.log("Server down");
                    $("#header").html("<h1 class='ui-title' style='background:#e88a99' role='heading' id='server_error'>Server Down</h1>");
                });
        }
    },

    stopPoll: function () {
        c.doPoll = false;
    },

    show: function (el) {
        $('#iframe').get(0).contentWindow.latLng = {lat: el.geo_lat, long: el.geo_long};
        $('#iframe').get(0).contentWindow.order = "Order #" + el.id;
        console.log($('#iframe').get(0).contentWindow.latLng);
        $('#iframe').get(0).contentWindow.initialize();
        $("#product_data").html('<b>Name:</b> ' + el.name + '<br />' + '<b>Price: </b>$' +el.price);
    },

    getMostOrdered: function(){
        var maxN = 0,
            mOrdered;
        this.config.mostOrdered = new Object();
        $.each(this.config.data, function (i, el) {
            if(app.config.mostOrdered[el.name.toString()] === undefined){
                app.config.mostOrdered[el.name.toString()] = 1;
            } else {
                app.config.mostOrdered[el.name.toString()] += 1;
            }
        });

        for (var property in app.config.mostOrdered) {
            if (app.config.mostOrdered.hasOwnProperty(property)) {
                if(app.config.mostOrdered[property] > maxN){
                    maxN = app.config.mostOrdered[property];
                    mOrdered = property;
                }
            }
        }

        this.config.mostOrdered.mostOrdered = mOrdered;
        return this.config.mostOrdered;
    },

    initMap: function(){
        $( document ).on( "pagecreate", function() {
            // The window width and height are decreased by 30 to take the tolerance of 15 pixels at each side into account
            function scale( width, height, padding, border ) {
                var scrWidth = $( window ).width() - 30,
                    scrHeight = $( window ).height() - 30,
                    ifrPadding = 2 * padding,
                    ifrBorder = 2 * border,
                    ifrWidth = width + ifrPadding + ifrBorder,
                    ifrHeight = height + ifrPadding + ifrBorder,
                    h, w;
                if ( ifrWidth < scrWidth && ifrHeight < scrHeight ) {
                    w = ifrWidth;
                    h = ifrHeight;
                } else if ( ( ifrWidth / scrWidth ) > ( ifrHeight / scrHeight ) ) {
                    w = scrWidth;
                    h = ( scrWidth / ifrWidth ) * ifrHeight;
                } else {
                    h = scrHeight;
                    w = ( scrHeight / ifrHeight ) * ifrWidth;
                }
                return {
                    'width': w - ( ifrPadding + ifrBorder ),
                    'height': h - ( ifrPadding + ifrBorder )
                };
            };
            $( ".ui-popup iframe" )
                .attr( "width", 0 )
                .attr( "height", "auto" );
            $( "#popupMap iframe" ).contents().find( "#map_canvas" )
                .css( { "width" : 0, "height" : 0 } );
            $( "#popupMap" ).on({
                popupbeforeposition: function() {
                    var size = scale( 480, 350, 0, 1 ),
                        w = size.width,
                        h = size.height;
                    $( "#popupMap iframe" )
                        .attr( "width", w )
                        .attr( "height", h );
                    $( "#popupMap iframe" ).contents().find( "#map_canvas" )
                        .css( { "width": w, "height" : 320, "border": 'solid 1px #000' } );
                },
                popupafterclose: function() {
                    $( "#popupMap iframe" )
                        .attr( "width", 0 )
                        .attr( "height", 0 );
                    $( "#popupMap iframe" ).contents().find( "#map_canvas" )
                        .css( { "width": 0, "height" : 0 } );
                }
            });
        });
    }
};

var eInterval = window.setInterval(function () {
    app.poll();
},5000);