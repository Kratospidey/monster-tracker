import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render dashboard headings', () => {
		render(Page);
		expect(screen.getByRole('heading', { name: /Recent Drinks.*View All/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Spending Over Time/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Drinks by Series/i })).toBeInTheDocument();
	});
});
