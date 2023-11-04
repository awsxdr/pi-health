import { Alignment, Button, Navbar } from '@blueprintjs/core';

type ToolbarProps = {
    onAddServer?: () => void,
};

export const Toolbar = ({ onAddServer }: ToolbarProps) => {
    return (
        <Navbar fixedToTop>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>Health monitor</Navbar.Heading>
                <Navbar.Divider></Navbar.Divider>
                <Button className='bp5-minimal' icon='plus' text='Add server' onClick={onAddServer} />
            </Navbar.Group>
        </Navbar>
    );
}