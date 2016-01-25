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
        activeColor: '#066',
        width: 44
    };

    touchStart = () => {
        console.log(this.props.children);
        this.setState({ active: true });
    };

    touchEnd = () => {
        console.log('touchEnd');
        this.setState({ active: false });
    };

    render() {
        const {bgColor, bgActive, transparent, width} = this.props;

        const color = this.state.active ? bgActive : bgColor;

        const style = {
            display: 'inline-block',
            width: width,
            height: 32,
            backgroundColor: transparent ? 'white' : color,
            color: transparent ? color : 'white',
            lineHeight: transparent ? '28px' : '32px',
            textAlign: 'center',
            borderRadius: 4,
            marginLeft: 5,
            fontFamily: 'helvetica-light',
            boxSizing: 'border-box',
            border: transparent ? '2px solid' : 'none'
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
