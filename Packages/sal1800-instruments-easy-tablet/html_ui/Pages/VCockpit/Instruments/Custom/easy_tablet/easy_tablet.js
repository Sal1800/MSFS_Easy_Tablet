class EasyTablet extends BaseInstrument {
    constructor() {
        super();
        this.selectedPage = 0; // currently displayed page index
        this.wantedMode = 0;    // page index requested
        this.pages = [];    // array of available page element references
        this.navIcons = []; // array of navIcon element references
        this.incrementMin = 0  // default increment minimum value
        this.incrementMax = 4;  // default increment maximum value
        this.incrementStep = 1 // default increment step value
        this.valueIndicators = [];  // array of indicators that can update with a watched simvar
        this.disableList = []; // array of elements that can be disabled with a watched simvar
        this.visibleList = []; // array of elements that can be hidden with a watched simvar
        this.mapMode = 0;
    }
    get isInteractive() { return true; }

    connectedCallback() {
        super.connectedCallback();
        this.navContainer = this.getChildById('navigation');
        this.pages = this.querySelectorAll('.page');
        this.pages.forEach( (page, index) => this.createPageNav(page, index));
        this.initInteractives();
        this.initVisibiles();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    Init() {
        super.Init();
    }

    onInteractionEvent(_args) {
        let _event = _args[0];
    }

    Update(_deltaTime) {
        super.Update(_deltaTime);
        if (this.isElectricityAvailable()) {

        }
        // switch pages
        if (this.wantedMode != this.selectedPage) {
            this.pages.forEach( (page, i) => {
                this.setState(page, this.wantedMode == i);
            });
            this.selectedPage = this.wantedMode;
        }
        // update indicators
        this.updateIndicators();
        // update disabledList
        this.updateDisabled();
        // update visible/hidden elements
        this.updateVisible();
    }

    updateIndicators() {
        this.valueIndicators.forEach( indicator => {
            if ('dataFunction' in indicator) {
                this.setIndicatorFunc(indicator.ele, indicator.dataFunction, indicator.units, indicator.decimal || 0, indicator.suffix || '', indicator.prefix || '');
            } else {
            this.setIndicator(indicator.ele, indicator.dataVar, indicator.units, indicator.decimal || 0, indicator.suffix || '', indicator.prefix || '');
            }
        });
    }
    updateDisabled() {
        this.updateWatched(this.disableList, 'disabled');
    }

    updateVisible() {
        this.updateWatched(this.visibleList, 'show');
    }

    updateWatched(list, className) {
        list.forEach( item => {
            let state = false;
            const prevState = item.ele.classList.contains(className);
            const fn = (dataVar) => {
                if (dataVar.substr(0,1) === '!') {
                    return !this.getVar(dataVar.slice(1), 'bool');
                } else {
                    return this.getVar(dataVar, 'bool');                    
                }
            }
            if (item.mode && item.mode == 'and') {
                state = item.dataVars.every(fn);
            } else {
                state = item.dataVars.some(fn);
            }
            
            if (state != prevState) {
                item.ele.classList.remove(className);
                if (state) {
                    item.ele.classList.add(className);
                }
            }
        });
    }


    createPageNav(page, index) {
        if (page.classList.contains('active')) {
            this.selectedPage = index;
        }
        if (this.navContainer) {
            const navIcon = document.createElement('div');
            navIcon.id = page.id ? `nav_${page.id}` : `nav_${this.navIcons.length + 1}`;
            navIcon.innerText = page.getAttribute('data-name');
            navIcon.addEventListener('mouseup', () => this.selectPage(index));
            this.navContainer.append(navIcon);
            this.navIcons.push(navIcon);  
        }
    }

    selectPage(index) {
        if (this.pages.length > index) {
            this.wantedMode = index;
        }
    }

    getIcon(name) {
        // return svg element
        const container = document.createElement('div');
        switch (name) {
            case 'iconArrowLeft':
                container.id = 'iconArrowLeft';
                container.innerHTML = `
                    <svg class="arrow_left" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
                    <path style="stroke-width:0" d="M 4.1224843,14.756685 21.709096,0.91893617 c 0.11498,-0.0904701 0.30011,-0.0904701 0.41509,0 V 28.921042 c -0.11498,0.09047 -0.30011,0.09047 -0.41509,0 L 4.1224837,15.083293 c -0.1149798,-0.09047 -0.1149796,-0.236137 6e-7,-0.326608 z" /></svg>`; 
        }
        return container;
    }

    /* this method initializes the "components" based on their class name. 
        the method only runs once, so all the elements need to be in the template
    */

    initInteractives() {
        /* indicator: data-indicator: simVar to display
                      data-units: default number
                      data-prefix: optional string to prefix value
                      data-suffix: optional string to suffix value
                      data-decimal: default 0, display decimal places
                      data-function: use custom function for value
        */
        const indicators = this.querySelectorAll('.indicator');
        indicators.forEach( node => {
            const dataIndicator = node.getAttribute('data-indicator');
            const dataFunction = node.getAttribute('data-function');
            const dataUnits = node.getAttribute('data-units') || 'number';
            const dataPrefix = node.getAttribute('data-prefix') || '';
            const dataSuffix = node.getAttribute('data-suffix') || '';
            const dataDecimal = node.getAttribute('data-decimal') || 0;
            if (dataIndicator) {
               this.valueIndicators.push({dataVar: dataIndicator, units: dataUnits, ele: node, prefix: dataPrefix, suffix: dataSuffix, decimal: dataDecimal});
            } else if (dataFunction) {
               this.valueIndicators.push({dataFunction: dataFunction, units: dataUnits, ele: node, prefix: dataPrefix, suffix: dataSuffix, decimal: dataDecimal});
            }
        });

        /* toggle: data-var must specifiy a bool simvar
                    optional data-disable simvar
        */
        const toggles = this.querySelectorAll('.toggle');
        toggles.forEach( node => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            node.append(indicator);
            const dataVar = node.getAttribute('data-var');
            if (dataVar) {
                node.addEventListener('mouseup', () => this.setState(node, this.toggleVar(dataVar, node)));
                this.setIndicator(node, dataVar, 'bool');
            }
            const dataDisable = node.getAttribute('data-disable');
            this.initDisable(dataDisable, node);
        });
        /* event: sends a sim event when clicked
                data-var specifies the event ID
                data-val is an optional value to send to the event
                data-indicator is an optional bool simvar to indicate state
        */
        const events = this.querySelectorAll('.event');
        events.forEach( node => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            const dataIndicator = node.getAttribute('data-indicator');
            if (dataIndicator) {
               this.valueIndicators.push({dataVar: dataIndicator, units: 'bool', ele: indicator});
            }
            node.append(indicator);
            const dataVal = node.getAttribute('data-val') || 0;
            const func = node.getAttribute('data-function');
            if (func) {
                node.addEventListener('mouseup', () => {
                    this.callFunction(func, parseFloat(dataVal));
                });
            } else {
                const dataVar = node.getAttribute('data-var');
                if (dataVar) {
                    node.addEventListener('mouseup', () => this.setEvent(dataVar, parseFloat(dataVal)));
                }
            }                
            const dataDisable = node.getAttribute('data-disable');
            this.initDisable(dataDisable, node);
        });
        /* switch: must contain exactly two child elements with data-var attributes
            clicking the switch will toggle the state between both simvars
            first node is default selected or set data-state="1"
        */

        // TODO: set state of the simvars when created
        const switches = this.querySelectorAll('.switch');
        switches.forEach( node => {
            let dataVar1, dataVar2, state;
            const options = node.querySelectorAll('[data-var]');
            if (options && options.length == 2) {
                node.dataVar1 = options[0].getAttribute('data-var');
                node.dataVar2 = options[1].getAttribute('data-var');
                node.state = (node.getAttribute('data-state') > 0) ? 1 : 0;
                const indicator = document.createElement('div');
                indicator.className = 'indicator';
                node.prepend(indicator);
                node.addEventListener('mouseup', () => this.switchEvent(node));
            } else {
                node.classList.add('disabled');
            }
        });
        /* increment: increment/decrement on each click
            data-var is the number type simvar
            data-units is the optional simvar units (default: number)
            data-indicator is an optional number simvar to indicate value
            data-min is the optional minimum value (default: 0)
            data-max is the optional maximum value (default: 5)
            data-step is the optional inc/dec step amount (default: 1)
            data-loop is an optional bool flag to wrap around values

        */
        const increment = this.querySelectorAll('.increment');
        increment.forEach( node => {
            const dataVar = node.getAttribute('data-var');
            const selector = document.createElement('div');
            selector.className = 'select';
            const attrs = [this.incrementMin, this.incrementMax, this.incrementStep];
            const dataMin = node.getAttribute('data-min');
            if (dataMin) attrs[0] = parseFloat(dataMin);
            const dataMax = node.getAttribute('data-max');
            if (dataMax) attrs[1] = parseFloat(dataMax);
            const dataStep = node.getAttribute('data-step');
            if (dataStep) attrs[2] = parseFloat(dataStep);
            const dataUnits = node.getAttribute('data-units');
            const units = (dataUnits) ? dataUnits : 'number';
            const dec = document.createElement('div');
            dec.className = 'dec'
            if (dataVar) {
                dec.addEventListener('mouseup', () => this.setIncrement(dataVar, 0, attrs[0], attrs[1], attrs[2], units));
            }
            const lArrow = this.getIcon('iconArrowLeft');
            if (lArrow) dec.append(lArrow.cloneNode(true));  
            selector.append(dec);
            const span = document.createElement('span');
            const dataIndicator = node.getAttribute('data-indicator');
            if (dataIndicator) {
               this.valueIndicators.push({dataVar: dataIndicator, units: 'number', ele: span});
            }
            span.innerText = '0';
            selector.append(span);             
            const inc = document.createElement('div');
            if (lArrow) inc.append(lArrow.cloneNode(true)); 
            inc.className = 'inc'
            if (dataVar) {
                inc.addEventListener('mouseup', () => this.setIncrement(dataVar, 1, attrs[0], attrs[1], attrs[2], units));
            }                
            selector.append(inc);            
            node.append(selector);
        });
        /* button: calls a custom function
            data-function: the name of a custom function
            data-value: optional value to use as the argument
        */ 
        const buttons = this.querySelectorAll('.button');
        buttons.forEach( node => {
            const dataVal = node.getAttribute('data-val') || 0;
            const func = node.getAttribute('data-function');
            if (func) {
                if (node.nodeName == 'BUTTON') {
                    node.addEventListener('mouseup', () => {
                        this.callFunction(func, parseFloat(dataVal));
                    });
                }
            } else {
                const dataVar = node.getAttribute('data-var');
                if (dataVar) {
                    node.addEventListener('mouseup', () => this.setEvent(dataVar, parseFloat(dataVal)));
                }
            }
            const dataDisable = node.getAttribute('data-disable');
            this.initDisable(dataDisable, node);

        });
    }

    initDisable(dataDisable, node, mode="and") {
        if (dataDisable) {
            this.disableList.push({dataVars: dataDisable.split(','), ele: node, mode: mode});
        }
    }

    initVisibiles() {
        const visibles = this.querySelectorAll('[data-visible]');
        const mode = this.querySelectorAll('[data-mode]') || 'and';
        visibles.forEach( node => {
            const dataVars = node.getAttribute('data-visible');
            this.visibleList.push({dataVars: dataVars.split(','), ele: node, mode: mode});
        });
    }


    setState(node, value) {
        if (node) {
            if (value) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        }
    }

    setIndicator(node, dataVar, units, decimal, suffix = '', prefix = '') {
        if (units == 'bool') {
            this.setState(node, this.getVar(dataVar, units) || 0);
        } else {
            const data = this.getVar(dataVar, units).toFixed(decimal) || 0;
            diffAndSetText(node, `${prefix}${data}${suffix}`);
        }
    }

    setIndicatorFunc(node, dataFunction, units, decimal, suffix = '', prefix = '') {
        const val = this.callFunction(dataFunction, units);
        if (val === null) return;
        if (units == 'bool') {
            this.setState(node, val);
        } else {
            diffAndSetText(node, `${prefix}${val.toFixed(decimal)}${suffix}`);
        }
    }  

    callFunction(func, arg) {
        try {
            const customFunctions = this.customFunctions();
            return customFunctions[func](arg);
        } catch(e) {
            console.log(`cannot call ${func}`);
        }
        return null;
    }

    setEvent(dataVar, dataVal, units="number") {
        SimVar.SetSimVarValue(dataVar, units, dataVal);
    }

    setIncrement(dataVar, dir, min, max, step, loop = false, units = 'number') {
        const dataVal = this.getVar(dataVar, units);
        let value = (dir) ? Math.min(max, dataVal + step) : Math.max(min, dataVal - step);        
        if (loop) {
            if (dir && dataVal === max) value = min;
            if (!dir && dataVal === min) value = max;
        }
        SimVar.SetSimVarValue(dataVar, units, value);
        return value;
    }

    switchEvent(node) {
        if (node.state) {
            SimVar.SetSimVarValue(node.dataVar1, 'bool', 1);            
            SimVar.SetSimVarValue(node.dataVar2, 'bool', 0);
        } else {
            SimVar.SetSimVarValue(node.dataVar1, 'bool', 0);            
            SimVar.SetSimVarValue(node.dataVar2, 'bool', 1);
        }
        node.state = !node.state;
        node.setAttribute('data-state', node.state);  
    }


    toggleVar(dataVar, node) {
        let value = this.getVar(dataVar, "bool")
        if (node.classList.contains('disabled')) {
            return value
        }
        value = value == 0 ? 1 : 0 ;
        SimVar.SetSimVarValue(dataVar, "bool", value );
        return value;
    }

    getVar(name, units) {
        return SimVar.GetSimVarValue(name, units || 'bool');
    }

    getLocalTime() {
        return SimVar.GetGlobalVarValue("LOCAL TIME", "seconds");
    }
    getAbsoluteTime() {
        return SimVar.GetSimVarValue("E:ABSOLUTE TIME", "seconds");
    }  
    getZuluTime() {
        return SimVar.GetGlobalVarValue("ZULU TIME", "seconds"); 
    }        

    formatTime(sec) {
        return new Date(sec * 1000).toISOString().substr(11, 8);
    }


}

customElements.define("easy-tablet", EasyTablet);
//# sourceMappingURL=easy_tablet.js.map