# MSFS Easy Tablet Instrument Class

The Easy Tablet framework extends the BaseInstrument class to provide a set of UI components so you can build interfaces that can set or toggle Sim Vars or display Sim Var values.

When you create your own custom tablet instrument, you just need to extend from the EasyTablet class and then you can use any of the layout and components in your HTML template without having to add Javascript code for every function.

# Installing the Sim Package
From the Packages directory, copy the sal1800-instruments-easy-tablet package into your MSFS Community directory. This will make the Easy Tablet class available to your custom instrument. It also installs an example tablet instrument.

Use the panel.cfg and panel.xml entries to enable it in your aircraft. The tablet is intended to be at 720 x 1024 pixels vertical orientation. 

# Using the Easy Tablet Class

## Create your custom table instrument
You can create your custom table using the Easy_Tablet_Example included in the PackageSources directory. 
The HTML template should import the Easy Tablet script and stylesheet.

    <script type="text/html" import-script="/Pages/VCockpit/Instruments/Custom/easy_tablet/easy_tablet.js"></script>
	<link rel="stylesheet" href="/Pages/VCockpit/Instruments/Custom/easy_tablet/easy_tablet.css" />
You will be editing the HTML template to create your custom layout using components. 

The Javascript file only needs to contain these basics to extend the Easy Tablet Class.

    class EasyTabletExample extends EasyTablet {
	    constructor() {
	        super();
	    }
	    get templateID() { return "Easy_Tablet_Example"; }
	    connectedCallback() {
	        super.connectedCallback();
	    }
	    disconnectedCallback() {
	        super.disconnectedCallback();
	    }
	    Init() {
	        super.Init();
	    }
	    Update(_deltaTime) {
	        super.Update(_deltaTime);
	    }
	}
	registerInstrument("easy-tablet-example", EasyTabletExample);

Your instrument would replaces these with the name of your custom instrument: "EasyTabletExample", "Easy_Tablet_Example" and "easy-tablet-example".

## Add the panel.cfg and panel.xml entries

The panel.cfg connects your custom instrument to a virtual cockpit texture. 

    [VCockpit01]
	size_mm				= 720,1024
	pixel_size			= 720,1024
	texture				= $tablet_screen
	htmlgauge00=Custom/Easy_Tablet_Example/Easy_Tablet_Example.html,	0,  0, 720,1024
The panel.xml sets the state of the electricity. You can permanently set this to on. 

    <PlaneHTMLConfig>
	  <Instrument>
	    <Name>Easy_Tablet_Example</Name>
		<Electric>1</Electric>
	  </Instrument>
	</PlaneHTMLConfig>

# Layout
##  Pages
Pages are shown one at a time. For each page, a navigation link will be added to the Navigation section.
A page element must have a class name of "page" and a data-name attribute that will be used for the navigation link.
<pre>&lt;div class="page active" id="overview" data-name="Overview"&gt;</pre>
Adding a class of "active" to a page will make that page the first displayed.
## Columns
Columns can be used inside a page to make a two-column layout. Create a div with a class of "cols" to form the column group. Then add two divs with a class of "col" to create each column.
<pre>
&lt;div class="cols"&gt;
  &lt;div class="col"&gt;
  &lt;/div&gt;
  &lt;div class="col"&gt;
  &lt;/div&gt;
&lt;/div&gt;
</pre>

## Labels
Lables are like sub headings. Create a div with a class of "label".  

## Text Blocks
Text blocks are a div with class "text". They have some built-in margin. You can also use paragraph elements as text blocks.

## Spacers
A div element with a class of "space" will create some vertical space.
## Sections
A div element with a class of "section" can be used to group elements. It will have some bottom margin.
## Margin Classes
You can add any of these classes to a div to add margin-top of increasing amounts: "mt-0", "mt-1", "mt-2", "mt-3".
These classes will add margin-bottom of increasing amounts: "mb-0", "mb-1", "mb-2", "mb-3".
## Padding Classes
You can add any of these classes to a div to add padding-left of increasing amounts: "pl-0", "pl-1", "pl-2", "pl-3", "pl-4", "pl-5".
These classes will add padding-right of increasing amounts: "pr-0", "pr-1", "pr-2", "pr-3", "pr-4", "pr-5".
## Overriding CSS
In your instrument's CSS file, you can override any part of the Easy Tablet CSS. Prefix the selector with your instrument's element to give it higher precedence than the default selector. 
<pre>easy-tablet-example .indicator {
  border-radius: 0;
}
</pre>
# Components
Components are the way you can gain access to the SimVar.GetSimVarValue() and SimVar.SetSimVarValue() methods in an easy way. 

You write HTML div elements with a special class name to inform the script to turn those into dynamic elements. You will use attributes such as data-var to indicate which SimVar to act on. 

## Toggle Switches
Class name "toggle". 
Required Attribute: data-var. 
Always boolean SimVars.
<pre>&lt;div class="toggle" data-var="L:EXAMPLE_TOGGLE"&gt;Toggle Switch&lt;/div&gt;</pre>

## Event Switches
Class name "event". 
Required: data-var or data-function. 
Optional: data-val, data-indicator.
<pre>&lt;div class="event" data-var="K:TOGGLE_MASTER_BATTERY:1" 
 data-indicator="A:ELECTRICAL MASTER BATTERY"&gt;Master Battery&lt;/div&gt;</pre>
## Increment Control
 Class name "increment". 
 Required: data-var. 
 Optional: data-indicator, data-units, data-min, data-max, data-step.
 <pre class="wrap">&lt;div class="increment" data-var="L:EXAMPLE_INCREMENT" 
  data-indicator="L:EXAMPLE_INCREMENT" data-min ="0" data-max="20" data-step="2"&gt;
  Example Increment:&lt;/div&gt;</pre>
## Info Display
Class name "info". Inside this element should be a "indicator" with required data-indicator or data-function and optional data-units, data-decimal, data-prefix, data-suffix.
<pre>
&lt;div class="info"&gt;Example Display: 
	&lt;div class="indicator" data-indicator="L:EXAMPLE_DISPLAY" 
	data-decimal="0" data-suffix=" units"&gt;&lt;/div&gt;
&lt;/div&gt;	
</pre>
## Buttons
Class name "button". Buttons work similar to event switches. 
Required: data-var or data-function. 
Optional: data-val, data-indicator.
<pre>&lt;button class="button" data-var="L:EXAMPLE_BUTTON"
 data-val="100"&gt;Set value to 100&lt;/button&gt;</pre>
 ## Switches
 Class name "switch". Switches toggle two different SimVars. 
 Required: two data-var attributes. 
 Optional: data-state.
 <pre >
&lt;div class="switch"&gt;
	&lt;div data-var="L:EXAMPLE_STATE1"&gt;SimVar 1&lt;/div&gt;
	&lt;div data-var="L:EXAMPLE_STATE2"&gt;SimVar 2&lt;/div&gt;
&lt;/div&gt;</pre>	
# Utilities
## Visibility
Any element with a data-visible attribute will be hidden when the SimVar is true. To test for false values, prepend a "!" to the SimVar. Boolean only.
<pre>&lt;div data-visible="L:EXAMPLE_VISIBLE"&gt; Now you see me!&lt;/div&gt;</pre>
## Disabled
Any element with a data-disable attribute will be disabled when the SimVar is true. To test for false values, prepend a "!" to the SimVar. Boolean only.
<pre class="wrap">&lt;div class="toggle inline" data-disable="!L:EXAMPLE_ENABLE" 
data-var="L:EXAMPLE_LVAR"&gt; My Control&lt;/div&gt;</pre>

Visibility and Disabled can use more than one SimVar where both have to be true to set the state. Separate the SimVars with a comma. Default logic is AND. Use data-mode="or" to use OR logic. Negate the SimVars by prepending a "!".

## Custom Functions
All of the components so far have used simple SimVars but if you have more complex code or calculations, you can create custom functions that the components can call.

This is where you need to write some code into the Javascript file. The Easy Template framework will try to call a function named CustomFunctions. This function should return an object that contains all the custom functions you need. The key will be used in the HTML template as the data-function attribute value.

    // Define custom functions

    getFuelQuantity(units) {
        return SimVar.GetSimVarValue("A:FUEL TOTAL QUANTITY", units);
    }
    getFuelUseable(units) {
        const unuseable = SimVar.GetSimVarValue("A:UNUSABLE FUEL TOTAL QUANTITY", units);
        const qty = this.getFuelQuantity(units);
        return qty - unuseable;
    } 
    getEndurance() {
        const ff = SimVar.GetSimVarValue("A:ENG FUEL FLOW GPH:1", "gallons per hour");
        return (ff) ? this.getFuelUseable('gallons') / ff : 0;
    }  

    // This method is called when you use a function component
    customFunctions() {
        return {
            usuableFuel: (units = 'gallons') => {
                return this.getFuelUseable(units);
            },
            endurance: () => {
                return this.getEndurance();
            },
        };
    }
To use one of your custom functions, create an Info component like this: 

    <div class="info">Endurance: 
		<div class="indicator" data-function="endurance" data-units="hours" data-suffix=" hrs." data-decimal="2"></div>
	</div>

# Modifying the Easy Template Class
It is not recommended to edit the files in the Package. Most of the time you can override the methods in your custom instrument but if you need to change the behavior of the framework, create a copy with a unique name so your package does not collide with other Community packages that may rely on the Easy Tablet Class. 