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
        if (this.isElectricityAvailable()) {

        }
    }

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
            useableFuel: (units = 'gallons') => {
                return this.getFuelUseable(units);
            },
            endurance: () => {
                return this.getEndurance();
            },
        };
    }

}
registerInstrument("easy-tablet-example", EasyTabletExample);