class ICPixel extends ConnecTag.classes.Plugin
    @id = "ICPixel"

    constructor: () ->
        @initialized = false

    track: (settings, instances) ->
        instance = instances[0]
        protocol = window.location.protocol
        window.IC = {} unless window.IC?

        if settings.host?
            scriptUrl = "#{protocol}//#{settings.host}/#{settings.path}"
        else
            scriptUrl = settings.path

        @executeCommands(instance.commands, instance.id)

        if not @initialized
            @helpers.getScript scriptUrl, () =>
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
