import { isRouteMatchsUrl } from '../../src/routing';

describe('Routing', () => {
  it('should return if route is equal to url', () => {
    expect(
      isRouteMatchsUrl('/products/5/?id=2112', '/products/$id/'),
    ).toBeTruthy();
    expect(isRouteMatchsUrl('/products/5/', '/carts/$id/')).toBeFalsy();
    expect(isRouteMatchsUrl('/products/abc/', '/products/abc/')).toBeTruthy();
  });
});
