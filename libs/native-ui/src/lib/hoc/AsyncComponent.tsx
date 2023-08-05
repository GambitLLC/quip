import React, {Component} from 'react';

const asyncComponent = (importComponent: () => Promise<any>) => {
  return class extends Component {
    state: {
      component: null | JSX.Element
    } = {
      component: null
    }

    constructor(props: any) {
      super(props);
    }

    componentDidMount() {
      importComponent()
        .then(cmp => {
          this.setState({component: (cmp.default as JSX.Element)});
        });
    }

    render() {
      const C = this.state.component;
      // @ts-ignore
      return C ? <C {...this.props}/> : null;
    }
  }
};

export default asyncComponent;
