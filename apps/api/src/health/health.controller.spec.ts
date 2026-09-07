import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports that the process is healthy', () => {
    const result = new HealthController().check();
    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });
});
