using BuildingBlocks.Domain;
using MediatR;

namespace BuildingBlocks.Application.CQRS;

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}
