const React = require('react');

class Button extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false
        }
    }

    static defaultProps = {
        color: '#099',
        activeColor: '#066'
    };

    touchStart = () => {
        console.log(this.props.children);
        this.setState({ active: true });
    };

    touchEnd = () => {
        this.setState({ active: false });
    };

    render() {
        const {color, activeColor} = this.props;

        const style = {
            display: 'inline-block',
            width: 47.5,
            height: 32,
            backgroundColor: this.state.active ? activeColor : color,
            color: 'white',
            lineHeight: '32px',
            textAlign: 'center',
            borderRadius: 4,
            marginLeft: 5,
            fontFamily: 'helvetica-light'
        };

        return <div
            style={style}
            onTouchStart={this.touchStart}
            onTouchEnd={this.touchEnd}
        >
            {this.props.children}
        </div>;
    }
}

module.exports = Button;
