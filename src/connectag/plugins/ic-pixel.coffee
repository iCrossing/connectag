class ICPixel extends ConnecTag.classes.Plugin
    @id = "ICPixel"
    @url = "pixel.iclive.com/pixel-js/ic-pixel.js"

    constructor: () ->
        @initialized = false

    track: (settings, instances) ->
        instance = instances[0]
        protocol = if window.location.protocol is 'https:' then 'https' else 'http'
        window.IC = {} unless window.IC?

        @executeCommands(instance.commands, instance.id)

        if not @initialized
            @helpers.getScript "#{protocol}://#{ICPixel.url}", () =>
                @initialized = true

    methods: (() ->
        m = {}
        properties = [
            'pageAction'
            'sale'
            'price'
            'sku'
            'order_code'
            'user_defined1'
            'user_defined2'
            'user_defined3'
            'user_defined4'
            'currency_id'
            'ic_ch'
            'client_id'
            'domain_id'
        ]

        getPropertyHandler = (property) ->
            return (value) -> window.IC[property] = value

        # Build methods
        for property in properties
            m[property] = getPropertyHandler(property)

        m.pixel = -> window.IC.pixel()

        m
    )()

ConnecTag.classes.plugins.ICPixel = ICPixel
