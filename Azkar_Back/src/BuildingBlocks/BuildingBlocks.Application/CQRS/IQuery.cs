using BuildingBlocks.Domain;
using MediatR;

namespace BuildingBlocks.Application.CQRS;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
