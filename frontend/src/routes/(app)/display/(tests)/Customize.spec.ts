import { render, screen } from '@testing-library/svelte';
import Customize from '../Customize.svelte';
import userEvent from '@testing-library/user-event';

import { filters } from '../filters.svelte';
import type { DisplayDataRequest } from '../../../../../../lib/Request';

const fieldLabels = [
    "Music type", "Time frame", "Number of cells",
    "Rank determinant", "Include cell info"
];

describe('Test customization panel inputs', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();

    // makes it so that filters are saved between tests (mirroring real functionality)
    refresh.mockImplementation((localFilters: DisplayDataRequest) => {
        filters.aggregate = localFilters.aggregate;
        filters.num_cells = localFilters.num_cells;
        filters.rank_determinant = localFilters.rank_determinant;
        filters.date = {...localFilters.date};
    });

    // clear calls of mock function and render customization panel
    beforeEach(() => {
        refresh.mockClear();
        // pass our mocked function in the refresh prop
        render(Customize, {
            refresh,
            regenerateDisplay: () => {},
            exportDisplay: () => {}
        });
    });

    test('All expected fields should be enabled', async () => {
        for (const label of fieldLabels) {
            const musicTypeInput = screen.getByLabelText(label);
            expect(musicTypeInput).toBeInTheDocument();
            expect(musicTypeInput).toBeEnabled();
        }
    });

    test('Editing music type should trigger refresh with correct data', async () => {
        const musicTypeInput = screen.getByLabelText("Music type");
        await user.selectOptions(musicTypeInput, "song");

        expect(refresh).toBeCalled();
        const firstCall = refresh.mock.calls[0][0];
        expect(firstCall.aggregate).toBe("song");
    });

    test('Not modifying music type should not trigger refresh', async () => {
        const musicTypeInput = screen.getByLabelText("Music type");
        await user.selectOptions(musicTypeInput, "song");
        expect(refresh).not.toBeCalled();
    });

    test('Editing rank determinant should trigger refresh with correct data', async () => {
        const rankDeterminantInput = screen.getByLabelText("Rank determinant");
        await user.selectOptions(rankDeterminantInput, "time");

        expect(refresh).toBeCalled();
        const firstCall = refresh.mock.calls[0][0];
        expect(firstCall.rank_determinant).toBe("time");
    });

    test('Not modifying rank determinant should not trigger refresh', async () => {
        const rankDeterminantInput = screen.getByLabelText("Rank determinant");
        await user.selectOptions(rankDeterminantInput, "time");
        expect(refresh).not.toBeCalled();
    });

    //This is failing, says refresh isn't being called even though on the app it is
    test('Modifying time frame should trigger refresh', async () => {
        const timeFrameInput = screen.getByLabelText("Time frame");
        await user.selectOptions(timeFrameInput, "this month");

        expect(refresh).toBeCalled();
        const firstCall = refresh.mock.calls[0][0];
        expect(firstCall.time_frame).toBe("this-month");
    });

    test('Entering a value into number of cells should refresh the display', async () => {
        const numCellsInput = screen.getByLabelText("Number of cells");

        //Clear the current number
        await user.clear(numCellsInput);
        expect(numCellsInput).toHaveValue(null);

        //Set the current number to 1
        await user.type(numCellsInput, "1");
        expect(numCellsInput).toHaveValue(1);

        //Click somewhere else on the screen (this might need to be changed in the future)
        const display = screen.getAllByRole("heading")[1]
        await user.click(display);

        expect(refresh).toBeCalled();
    });


});

describe('Test customization panel buttons', async () => {
    const user = userEvent.setup();
    const regenerateDisplay = vi.fn();
    const exportDisplay = vi.fn();

    // clear calls of mock function and render customization panel
    beforeEach(() => {
        // pass our mocked function in the refresh prop
        render(Customize, {
            refresh: () => {},
            regenerateDisplay,
            exportDisplay
        });
    });

    test('Clicking regenerate should call regenerate function', async () => {
        await user.click(screen.getByText("Regenerate"));
        expect(regenerateDisplay).toBeCalled();
    });

    test('Clicking export should call export function', async () => {
        await user.click(screen.getByText("Export"));
        expect(exportDisplay).toBeCalled();
    });

    test('Clicking "Close" and "Customize" should toggle the customization menu', async () => {
        await user.click(screen.getByText("Close"));
        let customizeHeading = screen.queryByRole("heading", { name: "Customize" });
        expect(customizeHeading).not.toBeInTheDocument();

        await user.click(screen.getByText("Customize"));
        customizeHeading = screen.queryByRole("heading", { name: "Customize" });
        expect(customizeHeading).toBeInTheDocument();
    });
});